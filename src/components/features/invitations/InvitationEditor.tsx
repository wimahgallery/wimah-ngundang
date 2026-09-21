"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES, normalizeInvitation, type CustomSettings, type GiftAccount, type Invitation, type SectionKey } from "@/lib/invitation";
import { templateMeta } from "@/components/invitation/template-registry";
import { uploadFile } from "@/lib/crop-image";
import ImageField from "./ImageField";
import GalleryField from "./GalleryField";
import SectionSettingsPanel from "./SectionSettingsPanel";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function InvitationEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isDirty = useRef(false);
  const initialJson = useRef<string>("");

  useEffect(() => {
    fetch(`/api/invitations/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Undangan tidak ditemukan");
        return res.json();
      })
      .then((json) => {
        const data = normalizeInvitation(json.data);
        setInvitation(data);
        initialJson.current = JSON.stringify(data);
      })
      .catch((err) => setError(err.message));
  }, [slug]);

  useEffect(() => {
    if (!invitation) return;
    isDirty.current = JSON.stringify(invitation) !== initialJson.current;
  }, [invitation]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const patch = useCallback((partial: Partial<Invitation>) => {
    setInvitation((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const patchSettings = useCallback((key: SectionKey, next: CustomSettings[SectionKey]) => {
    setInvitation((prev) =>
      prev ? { ...prev, custom_settings: { ...prev.custom_settings, [key]: next } } : prev,
    );
  }, []);

  async function save(extra: Partial<Invitation> = {}) {
    if (!invitation) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...invitation, ...extra };
      const res = await fetch(`/api/invitations/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan");
        return;
      }
      const next = normalizeInvitation(json.data);
      setInvitation(next);
      initialJson.current = JSON.stringify(next);
      isDirty.current = false;
      if (next.slug !== slug) router.replace(`/dashboard/invitations/${next.slug}`);
    } catch {
      setError("Gagal menyimpan. Periksa koneksi internet.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !invitation) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!invitation) {
    return <p className="text-sm text-muted-foreground">Memuat editor...</p>;
  }

  const settings = invitation.custom_settings;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">{invitation.event_title || invitation.slug}</h1>
          <p className="text-sm text-muted-foreground">/{invitation.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/preview/invitation/${invitation.slug}`}
            target="_blank"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm"
          >
            Preview
          </Link>
          <Button variant="secondary" onClick={() => void save({ is_published: !invitation.is_published })}>
            {invitation.is_published ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <EditorCard title="1. Informasi Acara">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug">
            <input className={inputClass} value={invitation.slug} onChange={(e) => patch({ slug: e.target.value })} />
          </Field>
          <Field label="Jenis acara">
            <select className={inputClass} value={invitation.event_type || ""} onChange={(e) => patch({ event_type: e.target.value })}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Judul acara" className="sm:col-span-2">
            <input className={inputClass} value={invitation.event_title || ""} onChange={(e) => patch({ event_title: e.target.value })} />
          </Field>
        </div>
      </EditorCard>

      <EditorCard title="2. Data Mempelai">
        <SectionSettingsPanel value={settings.couple} onChange={(next) => patchSettings("couple", next)} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nama mempelai wanita">
            <input className={inputClass} value={invitation.bride_name || ""} onChange={(e) => patch({ bride_name: e.target.value })} />
          </Field>
          <Field label="Nama mempelai pria">
            <input className={inputClass} value={invitation.groom_name || ""} onChange={(e) => patch({ groom_name: e.target.value })} />
          </Field>
          <Field label="Panggilan wanita">
            <input className={inputClass} value={invitation.bride_nickname || ""} onChange={(e) => patch({ bride_nickname: e.target.value })} />
          </Field>
          <Field label="Panggilan pria">
            <input className={inputClass} value={invitation.groom_nickname || ""} onChange={(e) => patch({ groom_nickname: e.target.value })} />
          </Field>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ImageField
            label="Foto mempelai wanita"
            value={invitation.bride_photo}
            onChange={(url) => patch({ bride_photo: url })}
            positionX={settings.couple.imagePositionX}
            positionY={settings.couple.imagePositionY}
            zoom={settings.couple.zoom}
            rotate={settings.couple.rotate}
            onPositionChange={(x, y) => patchSettings("couple", { ...settings.couple, imagePositionX: x, imagePositionY: y })}
            onZoomChange={(zoom) => patchSettings("couple", { ...settings.couple, zoom })}
            onRotateChange={(rotate) => patchSettings("couple", { ...settings.couple, rotate })}
          />
          <ImageField
            label="Foto mempelai pria"
            value={invitation.groom_photo}
            onChange={(url) => patch({ groom_photo: url })}
            positionX={invitation.groom_image_position_x}
            positionY={invitation.groom_image_position_y}
            zoom={invitation.groom_image_zoom}
            rotate={invitation.groom_image_rotate}
            onPositionChange={(x, y) => patch({ groom_image_position_x: x, groom_image_position_y: y })}
            onZoomChange={(zoom) => patch({ groom_image_zoom: zoom })}
            onRotateChange={(rotate) => patch({ groom_image_rotate: rotate })}
          />
        </div>
      </EditorCard>

      <EditorCard title="3. Hero">
        <SectionSettingsPanel value={settings.hero} onChange={(next) => patchSettings("hero", next)} />
        <div className="mt-4 grid gap-4">
          <Field label="Hero title">
            <input className={inputClass} value={invitation.hero_title || ""} onChange={(e) => patch({ hero_title: e.target.value })} />
          </Field>
          <Field label="Hero subtitle">
            <textarea className={inputClass} rows={3} value={invitation.hero_subtitle || ""} onChange={(e) => patch({ hero_subtitle: e.target.value })} />
          </Field>
          <ImageField
            label="Cover image"
            value={invitation.cover_image}
            onChange={(url) => patch({ cover_image: url })}
            positionX={settings.hero.imagePositionX}
            positionY={settings.hero.imagePositionY}
            zoom={settings.hero.zoom}
            rotate={settings.hero.rotate}
            onPositionChange={(x, y) => patchSettings("hero", { ...settings.hero, imagePositionX: x, imagePositionY: y })}
            onZoomChange={(zoom) => patchSettings("hero", { ...settings.hero, zoom })}
            onRotateChange={(rotate) => patchSettings("hero", { ...settings.hero, rotate })}
          />
        </div>
      </EditorCard>

      <EditorCard title="4. Jadwal">
        <SectionSettingsPanel value={settings.schedule} onChange={(next) => patchSettings("schedule", next)} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal">
            <input type="date" className={inputClass} value={invitation.event_date || ""} onChange={(e) => patch({ event_date: e.target.value })} />
          </Field>
          <Field label="Waktu">
            <input className={inputClass} value={invitation.event_time || ""} onChange={(e) => patch({ event_time: e.target.value })} />
          </Field>
        </div>
      </EditorCard>

      <EditorCard title="5. Lokasi">
        <SectionSettingsPanel value={settings.venue} onChange={(next) => patchSettings("venue", next)} />
        <div className="mt-4 grid gap-4">
          <Field label="Nama venue">
            <input className={inputClass} value={invitation.venue_name || ""} onChange={(e) => patch({ venue_name: e.target.value })} />
          </Field>
          <Field label="Alamat">
            <textarea className={inputClass} rows={2} value={invitation.venue_address || ""} onChange={(e) => patch({ venue_address: e.target.value })} />
          </Field>
          <Field label="Google Maps URL">
            <input className={inputClass} value={invitation.google_maps_url || ""} onChange={(e) => patch({ google_maps_url: e.target.value })} />
          </Field>
        </div>
      </EditorCard>

      <EditorCard title="6. Cerita">
        <SectionSettingsPanel value={settings.story} onChange={(next) => patchSettings("story", next)} />
        <div className="mt-4 grid gap-4">
          <Field label="Judul cerita">
            <input className={inputClass} value={invitation.story_title || ""} onChange={(e) => patch({ story_title: e.target.value })} />
          </Field>
          <Field label="Isi cerita (pisahkan bab dengan baris kosong)">
            <textarea className={inputClass} rows={8} value={invitation.story_content || ""} onChange={(e) => patch({ story_content: e.target.value })} />
          </Field>
        </div>
      </EditorCard>

      <EditorCard title="7. Galeri">
        <SectionSettingsPanel value={settings.gallery} onChange={(next) => patchSettings("gallery", next)} />
        <div className="mt-4">
          <GalleryField images={invitation.gallery_images} onChange={(gallery_images) => patch({ gallery_images })} />
        </div>
      </EditorCard>

      <EditorCard title="8. Gift">
        <SectionSettingsPanel value={settings.gift} onChange={(next) => patchSettings("gift", next)} />
        <div className="mt-4 space-y-3">
          {invitation.gift_accounts.map((gift, index) => (
            <div key={gift.id} className="grid gap-3 rounded-2xl border border-[rgba(84,82,77,0.08)] p-4 sm:grid-cols-3">
              <input className={inputClass} placeholder="Bank" value={gift.bank} onChange={(e) => patchGift(invitation, patch, index, { bank: e.target.value })} />
              <input className={inputClass} placeholder="Nomor rekening" value={gift.accountNumber} onChange={(e) => patchGift(invitation, patch, index, { accountNumber: e.target.value })} />
              <input className={inputClass} placeholder="Atas nama" value={gift.accountName} onChange={(e) => patchGift(invitation, patch, index, { accountName: e.target.value })} />
              <button
                type="button"
                className="text-left text-xs text-red-500"
                onClick={() => patch({ gift_accounts: invitation.gift_accounts.filter((g) => g.id !== gift.id) })}
              >
                Hapus
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              patch({
                gift_accounts: [
                  ...invitation.gift_accounts,
                  { id: uuid(), bank: "", accountNumber: "", accountName: "" } satisfies GiftAccount,
                ],
              })
            }
          >
            Tambah rekening
          </Button>
        </div>
      </EditorCard>

      <EditorCard title="9. Musik">
        <SectionSettingsPanel value={settings.music} onChange={(next) => patchSettings("music", next)} />
        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept="audio/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await uploadFile(file);
                patch({ music_url: url });
              } catch {
                setError("Gagal mengunggah musik");
              }
            }}
          />
          {invitation.music_url && <audio controls src={invitation.music_url} className="w-full" aria-label="Musik undangan" />}
        </div>
      </EditorCard>

      <EditorCard title="10. Template">
        <p className="mb-4 text-sm text-muted-foreground">Semua template memakai data yang sama. Preview memakai dummy data.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateMeta.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => patch({ template_id: tpl.id })}
              className={`rounded-2xl border p-4 text-left ${invitation.template_id === tpl.id ? "border-primary bg-primary/10" : "border-border bg-white"}`}
            >
              <p className="font-heading text-lg">{tpl.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tpl.description}</p>
              <Link href={`/preview/${tpl.id}`} target="_blank" className="mt-3 inline-block text-xs text-primary">
                Lihat preview
              </Link>
            </button>
          ))}
        </div>
      </EditorCard>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="mb-4 font-heading text-xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function patchGift(
  invitation: Invitation,
  patch: (partial: Partial<Invitation>) => void,
  index: number,
  next: Partial<GiftAccount>,
) {
  patch({
    gift_accounts: invitation.gift_accounts.map((g, i) => (i === index ? { ...g, ...next } : g)),
  });
}
