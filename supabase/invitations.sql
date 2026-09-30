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
