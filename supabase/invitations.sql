CREATE TABLE IF NOT EXISTS invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  template_id text NOT NULL DEFAULT 'lume',
  event_type text,
  event_title text,
  groom_name text,
  bride_name text,
  groom_nickname text,
  bride_nickname text,
  groom_photo text,
  bride_photo text,
  cover_image text,
  hero_title text,
  hero_subtitle text,
  event_date date,
  event_time text,
  venue_name text,
  venue_address text,
  google_maps_url text,
  story_title text,
  story_content text,
  music_url text,
  greeting_text text,
  recipient_name text,
  groom_parents text,
  bride_parents text,
  groom_social jsonb,
  bride_social jsonb,
  story_milestones jsonb DEFAULT '[]'::jsonb,
  events jsonb DEFAULT '[]'::jsonb,
  video_url text,
  video_poster text,
  rsvp_enabled boolean DEFAULT false,
  fun_facts jsonb DEFAULT '[]'::jsonb,
  closing_message text,
  closing_image text,
  qris_image text,
  groom_image_position_x int DEFAULT 50 NOT NULL,
  groom_image_position_y int DEFAULT 50 NOT NULL,
  groom_image_zoom int DEFAULT 100 NOT NULL,
  groom_image_rotate int DEFAULT 0 NOT NULL,
  gallery_images jsonb DEFAULT '[]'::jsonb NOT NULL,
  gift_accounts jsonb DEFAULT '[]'::jsonb NOT NULL,
  custom_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS invitations_slug_idx ON invitations (slug);
CREATE INDEX IF NOT EXISTS invitations_published_idx ON invitations (is_published);
CREATE INDEX IF NOT EXISTS invitations_user_id_idx ON invitations (user_id);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published invitations" ON invitations;
CREATE POLICY "Public can view published invitations" ON invitations
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invitations" ON invitations;
CREATE POLICY "Users can insert their own invitations" ON invitations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invitations" ON invitations;
CREATE POLICY "Users can update their own invitations" ON invitations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invitations" ON invitations;
CREATE POLICY "Users can delete their own invitations" ON invitations
  FOR DELETE USING (auth.uid() = user_id);

-- ── Sinkronisasi kolom (aman dijalankan berulang pada database yang sudah ada) ──
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS greeting_text text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS recipient_name text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS groom_parents text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS bride_parents text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS groom_social jsonb;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS bride_social jsonb;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS story_milestones jsonb DEFAULT '[]'::jsonb;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS events jsonb DEFAULT '[]'::jsonb;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS video_poster text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS rsvp_enabled boolean DEFAULT false;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS fun_facts jsonb DEFAULT '[]'::jsonb;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS closing_message text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS closing_image text;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS qris_image text;

-- ── Rename template elegant-classic → lume (aman dijalankan berulang) ──
ALTER TABLE invitations ALTER COLUMN template_id SET DEFAULT 'lume';
UPDATE invitations SET template_id = 'lume' WHERE template_id = 'elegant-classic';

-- ── Ucapan tamu / konfirmasi RSVP (aman dijalankan berulang) ──
CREATE TABLE IF NOT EXISTS guest_wishes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_slug text NOT NULL,
  name text NOT NULL,
  message text,
  attendance text,
  guest_count int,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS guest_wishes_slug_idx ON guest_wishes (invitation_slug);

ALTER TABLE guest_wishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view wishes of published invitations" ON guest_wishes;
CREATE POLICY "Public can view wishes of published invitations" ON guest_wishes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.slug = guest_wishes.invitation_slug AND i.is_published = true
    )
  );

DROP POLICY IF EXISTS "Public can insert wishes for published invitations" ON guest_wishes;
CREATE POLICY "Public can insert wishes for published invitations" ON guest_wishes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.slug = guest_wishes.invitation_slug AND i.is_published = true
    )
  );

-- ── Anti-spam: 1 device = 1 baris, dan device hanya bisa mengedit miliknya sendiri ──
-- (aman dijalankan berulang pada database yang sudah ada)

ALTER TABLE guest_wishes ADD COLUMN IF NOT EXISTS device_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS guest_wishes_slug_device_uk ON guest_wishes (invitation_slug, device_id);

-- Akses tabel langsung dari PostgREST dicabut — semua baca/tulis lewat fungsi di bawah,
-- supaya device_id (kunci edit milik sendiri) tidak pernah bisa dibaca pihak lain.
REVOKE ALL ON TABLE guest_wishes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_guest_wishes(p_slug text, p_device_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', w.id,
    'name', w.name,
    'message', w.message,
    'attendance', w.attendance,
    'guest_count', w.guest_count,
    'created_at', w.created_at,
    'mine', p_device_id IS NOT NULL AND w.device_id = p_device_id
  ) ORDER BY w.created_at), '[]'::jsonb)
  FROM guest_wishes w
  WHERE w.invitation_slug = p_slug
    AND EXISTS (SELECT 1 FROM invitations i WHERE i.slug = w.invitation_slug AND i.is_published = true);
$$;

CREATE OR REPLACE FUNCTION public.submit_guest_wish(
  p_slug text,
  p_device_id uuid,
  p_name text,
  p_message text DEFAULT NULL,
  p_attendance text DEFAULT NULL,
  p_guest_count int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row jsonb;
BEGIN
  IF p_device_id IS NULL THEN
    RAISE EXCEPTION 'Perangkat tidak dikenal. Muat ulang halaman lalu coba lagi.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM invitations i WHERE i.slug = p_slug AND i.is_published = true) THEN
    RAISE EXCEPTION 'Undangan tidak ditemukan';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(p_name) > 80 THEN
    RAISE EXCEPTION 'Nama wajib diisi (maks. 80 karakter)';
  END IF;
  IF p_message IS NOT NULL AND length(p_message) > 1000 THEN
    RAISE EXCEPTION 'Ucapan maksimal 1000 karakter';
  END IF;
  IF p_attendance IS NOT NULL AND p_attendance NOT IN ('hadir', 'ragu', 'tidak') THEN
    RAISE EXCEPTION 'Pilihan kehadiran tidak valid';
  END IF;
  IF p_attendance = 'hadir' AND (p_guest_count IS NULL OR p_guest_count < 1 OR p_guest_count > 20) THEN
    RAISE EXCEPTION 'Jumlah tamu harus 1–20';
  END IF;

  INSERT INTO guest_wishes (invitation_slug, device_id, name, message, attendance, guest_count)
  VALUES (p_slug, p_device_id, trim(p_name), p_message, p_attendance, p_guest_count)
  ON CONFLICT (invitation_slug, device_id) DO NOTHING
  RETURNING jsonb_build_object(
    'id', id, 'name', name, 'message', message, 'attendance', attendance,
    'guest_count', guest_count, 'created_at', created_at, 'mine', true
  ) INTO v_row;

  IF v_row IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'created', 'row', v_row);
  END IF;

  SELECT jsonb_build_object(
    'id', w.id, 'name', w.name, 'message', w.message, 'attendance', w.attendance,
    'guest_count', w.guest_count, 'created_at', w.created_at, 'mine', true
  ) INTO v_row
  FROM guest_wishes w
  WHERE w.invitation_slug = p_slug AND w.device_id = p_device_id;

  RETURN jsonb_build_object('status', 'exists', 'row', v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_guest_wish(
  p_slug text,
  p_device_id uuid,
  p_name text,
  p_message text DEFAULT NULL,
  p_attendance text DEFAULT NULL,
  p_guest_count int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row jsonb;
BEGIN
  IF p_device_id IS NULL THEN
    RAISE EXCEPTION 'Perangkat tidak dikenal. Muat ulang halaman lalu coba lagi.';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) = 0 OR length(p_name) > 80 THEN
    RAISE EXCEPTION 'Nama wajib diisi (maks. 80 karakter)';
  END IF;
  IF p_message IS NOT NULL AND length(p_message) > 1000 THEN
    RAISE EXCEPTION 'Ucapan maksimal 1000 karakter';
  END IF;
  IF p_attendance IS NOT NULL AND p_attendance NOT IN ('hadir', 'ragu', 'tidak') THEN
    RAISE EXCEPTION 'Pilihan kehadiran tidak valid';
  END IF;
  IF p_attendance = 'hadir' AND (p_guest_count IS NULL OR p_guest_count < 1 OR p_guest_count > 20) THEN
    RAISE EXCEPTION 'Jumlah tamu harus 1–20';
  END IF;

  UPDATE guest_wishes w
  SET name = trim(p_name),
      message = COALESCE(p_message, w.message),
      attendance = COALESCE(p_attendance, w.attendance),
      guest_count = CASE
        WHEN p_attendance = 'hadir' THEN p_guest_count
        WHEN p_attendance IS NULL THEN w.guest_count
        ELSE NULL
      END
  WHERE w.invitation_slug = p_slug AND w.device_id = p_device_id
  RETURNING jsonb_build_object(
    'id', w.id, 'name', w.name, 'message', w.message, 'attendance', w.attendance,
    'guest_count', w.guest_count, 'created_at', w.created_at, 'mine', true
  ) INTO v_row;

  IF v_row IS NULL THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;
  RETURN jsonb_build_object('status', 'updated', 'row', v_row);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_guest_wish(p_slug text, p_device_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM guest_wishes w
  WHERE w.invitation_slug = p_slug AND w.device_id = p_device_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_guest_wishes(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_guest_wish(text, uuid, text, text, text, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_guest_wish(text, uuid, text, text, text, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_guest_wish(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_guest_wishes(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_guest_wish(text, uuid, text, text, text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_guest_wish(text, uuid, text, text, text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_guest_wish(text, uuid) TO anon, authenticated;

-- ── Pustaka musik: lagu diunggah sekali di dashboard, lalu dipilih dari editor.
--    Satu baris = satu lagu, sehingga undangan tidak menumpuk file musik sendiri.
--    (aman dijalankan berulang) ──
CREATE TABLE IF NOT EXISTS music_tracks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  file_id text,
  duration_seconds int,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS music_tracks_user_id_idx ON music_tracks (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS music_tracks_user_name_uk ON music_tracks (user_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS music_tracks_user_url_uk ON music_tracks (user_id, url);

ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own music" ON music_tracks;
CREATE POLICY "Users can view their own music" ON music_tracks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own music" ON music_tracks;
CREATE POLICY "Users can insert their own music" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own music" ON music_tracks;
CREATE POLICY "Users can update their own music" ON music_tracks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own music" ON music_tracks;
CREATE POLICY "Users can delete their own music" ON music_tracks
  FOR DELETE USING (auth.uid() = user_id);
