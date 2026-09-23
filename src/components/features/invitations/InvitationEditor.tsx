"use client";

import { useCallback, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { Plus, ArrowLeft, ArrowRight, Rocket, Save, Trash2, Eye, FileText, Image, Video, Music, MapPin, Calendar, Users, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_TYPES, normalizeInvitation, type Invitation, type CustomSettings, type SectionKey } from "@/lib/invitation";
import { useInvitation, useSaveInvitation, useDeleteInvitation } from "@/features/invitations/hooks";
import { templateMeta } from "@/components/invitation/template-registry";
import { uploadFile } from "@/lib/crop-image";
import { cn } from "@/lib/utils";
import ImageField from "./ImageField";
import GalleryField from "./GalleryField";
import SectionSettingsPanel from "./SectionSettingsPanel";

const inputClass =
  "w-full max-w-[65ch] rounded-md border border-border bg-white px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:py-1.5 md:text-sm";

const STEPS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Info", icon: FileText },
  { key: "couple", label: "Mempelai", icon: Users },
  { key: "hero", label: "Hero", icon: Image },
  { key: "greeting", label: "Sapaan", icon: FileText },
  { key: "story", label: "Cerita", icon: FileText },
  { key: "schedule", label: "Jadwal", icon: Calendar },
  { key: "venue", label: "Lokasi", icon: MapPin },
  { key: "gallery", label: "Galeri", icon: Image },
  { key: "video", label: "Video", icon: Video },
  { key: "gift", label: "Gift", icon: Gift },
  { key: "music", label: "Musik", icon: Music },
  { key: "countdown", label: "Countdown", icon: Calendar },
  { key: "rsvp", label: "RSVP", icon: Users },
  { key: "wishes", label: "Doa", icon: FileText },
  { key: "funfacts", label: "Trivia", icon: Gift },
  { key: "closing", label: "Penutup", icon: Save },
];

export default function InvitationEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: invitation, isLoading, error } = useInvitation(slug);
  const saveMutation = useSaveInvitation(slug);
  const deleteMutation = useDeleteInvitation();

const [activeStep, setActiveStep] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const settings = invitation?.custom_settings;

  const patch = useCallback((partial: Partial<Invitation>) => {
    if (!invitation) return;
    queryClient.setQueryData(["invitation", slug], { ...invitation, ...partial });
  }, [invitation, slug, queryClient]);

  const patchSettings = useCallback((key: SectionKey, next: CustomSettings[SectionKey]) => {
    if (!invitation) return;
    patch({ custom_settings: { ...invitation.custom_settings, [key]: next } });
  }, [invitation, patch]);

  const doSave = useCallback(async (extra: Partial<Invitation> = {}) => {
    if (!invitation) return;
    const result = await saveMutation.mutateAsync({ ...invitation, ...extra });
    const next = normalizeInvitation(result);
    queryClient.setQueryData(["invitation", slug], next);
  }, [invitation, slug, saveMutation, queryClient]);

  const handlePublish = async () => {
    await doSave({ is_published: true });
    setPublishDialogOpen(false);
  };

  const handleDraft = async () => {
    await doSave({ is_published: false });
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus undangan /${slug}?`)) return;
    await deleteMutation.mutateAsync(slug);
    router.push("/dashboard/invitations");
  };

  const onChangeField = useCallback((field: string, value: string) => {
    patch({ [field]: value } as Partial<Invitation>);
  }, [patch]);

  const onChangeGifts = useCallback((gifts: Invitation["gift_accounts"]) => {
    patch({ gift_accounts: gifts });
  }, [patch]);

  const onChangeFunFacts = useCallback((facts: Invitation["fun_facts"]) => {
    patch({ fun_facts: facts });
  }, [patch]);

  const onChangeGallery = useCallback((gallery_images: Invitation["gallery_images"]) => {
    patch({ gallery_images });
  }, [patch]);

  const ActiveIcon = STEPS[activeStep].icon;
  const stepTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const stepContent = useMemo(() => {
    const s = invitation?.custom_settings;
    if (!s) return null;
    switch (STEPS[activeStep].key) {
      case "info": return <StepInfo invitation={invitation!} onChange={onChangeField} />;
      case "couple": return <StepCouple invitation={invitation!} settings={s.couple} onChangeSettings={patchSettings} />;
      case "hero": return <StepHero invitation={invitation!} settings={s.hero} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "greeting": return <StepGreeting invitation={invitation!} onChange={onChangeField} />;
      case "story": return <StepStory invitation={invitation!} settings={s.story} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "schedule": return <StepSchedule invitation={invitation!} settings={s.schedule} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "venue": return <StepVenue invitation={invitation!} settings={s.venue} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "gallery": return <StepGallery invitation={invitation!} settings={s.gallery} onChangeSettings={patchSettings} onChangeGallery={onChangeGallery} />;
      case "video": return <StepVideo invitation={invitation!} onChange={onChangeField} />;
      case "gift": return <StepGift invitation={invitation!} settings={s.gift} onChangeSettings={patchSettings} onChangeGifts={onChangeGifts} />;
      case "music": return <StepMusic invitation={invitation!} settings={s.music} onChangeSettings={patchSettings} />;
      case "countdown": return <StepCountdown settings={s.countdown} onChangeSettings={patchSettings} />;
      case "rsvp": return <StepRsvp invitation={invitation!} onChange={onChangeField} />;
      case "wishes": return <StepWishes invitation={invitation!} onChange={onChangeField} />;
      case "funfacts": return <StepFunFacts invitation={invitation!} onChangeFacts={onChangeFunFacts} />;
      case "closing": return <StepClosing invitation={invitation!} settings={s.closing} onChangeSettings={patchSettings} onChange={onChangeField} />;
      default: return null;
    }
  }, [activeStep, invitation, patchSettings, onChangeField, onChangeGifts, onChangeFunFacts, onChangeGallery]);

  const selectStep = useCallback((i: number) => {
    setActiveStep(i);
    stepTabRefs.current[i]?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <Button variant="outline" onClick={() => router.push("/dashboard/invitations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="outline" size="sm" className="grid h-11 w-11 shrink-0 place-items-center p-0" onClick={() => router.push("/dashboard/invitations")} aria-label="Kembali ke daftar undangan">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-[clamp(1rem,0.9rem+0.6vw,1.375rem)] text-foreground">{invitation.event_title || invitation.slug}</h1>
            <p className="truncate text-xs text-muted-foreground">/{invitation.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className="min-h-11 px-3" onClick={() => router.push(`/preview/invitation/${invitation.slug}`)}>
            <Eye className="mr-1.5 h-4 w-4" /> Preview
          </Button>
          <Button variant={invitation.is_published ? "secondary" : "default"} size="sm" className="min-h-11 px-4" onClick={() => setPublishDialogOpen(true)} disabled={saveMutation.isPending}>
            <Rocket className="mr-1.5 h-4 w-4" /> {invitation.is_published ? "Published" : "Publish"}
          </Button>
          <Button variant="outline" size="sm" className="min-h-11 px-3" onClick={handleDraft} disabled={saveMutation.isPending}>
            <Save className="mr-1.5 h-4 w-4" /> Draft
          </Button>
          <Button variant="destructive" size="sm" className="grid h-11 w-11 place-items-center p-0" onClick={handleDelete} disabled={deleteMutation.isPending} aria-label="Hapus undangan">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-xs text-muted-foreground">Template:</Label>
        <Select
          value={invitation.template_id || "elegant-classic"}
          onValueChange={(v) => onChangeField("template_id", v ?? "elegant-classic")}
        >
          <SelectTrigger className="w-full min-w-0 max-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {templateMeta.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 pb-2 pt-2 backdrop-blur">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          <button type="button" aria-label="Bagian sebelumnya" onClick={() => selectStep(Math.max(0, activeStep - 1))} className="grid h-10 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
            {STEPS.map((step, i) => (
              <button
                key={step.key}
                ref={(el) => { stepTabRefs.current[i] = el; }}
                type="button"
                onClick={() => selectStep(i)}
                aria-current={activeStep === i ? "step" : undefined}
                className={`flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  activeStep === i ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <step.icon className="h-3.5 w-3.5" />
                {step.label}
              </button>
            ))}
          </div>
          <button type="button" aria-label="Bagian berikutnya" onClick={() => selectStep(Math.min(STEPS.length - 1, activeStep + 1))} className="grid h-10 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
        <div className="mb-4 flex items-center gap-2">
          <ActiveIcon className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-[clamp(0.9375rem,0.875rem+0.3vw,1.125rem)] text-foreground">{STEPS[activeStep].label}</h2>
        </div>
        {stepContent}
      </div>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Publish</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin mempublikasikan undangan ini?</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPublishDialogOpen(false)}>Batal</Button>
            <Button size="sm" onClick={handlePublish} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Mempublikasikan..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepInfo({ invitation, onChange }: { invitation: Invitation; onChange: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Slug"><input className={inputClass} value={invitation.slug || ""} onChange={(e) => onChange("slug", e.target.value)} /></Field>
      <Field label="Jenis acara">
        <select className={inputClass} value={invitation.event_type || ""} onChange={(e) => onChange("event_type", e.target.value)}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Judul acara" className="sm:col-span-2"><input className={inputClass} value={invitation.event_title || ""} onChange={(e) => onChange("event_title", e.target.value)} /></Field>
      <Field label="Nama mempelai wanita"><input className={inputClass} value={invitation.bride_name || ""} onChange={(e) => onChange("bride_name", e.target.value)} /></Field>
      <Field label="Nama mempelai pria"><input className={inputClass} value={invitation.groom_name || ""} onChange={(e) => onChange("groom_name", e.target.value)} /></Field>
      <Field label="Panggilan wanita"><input className={inputClass} value={invitation.bride_nickname || ""} onChange={(e) => onChange("bride_nickname", e.target.value)} /></Field>
      <Field label="Panggilan pria"><input className={inputClass} value={invitation.groom_nickname || ""} onChange={(e) => onChange("groom_nickname", e.target.value)} /></Field>
      <Field label="Nama orang tua wanita"><input className={inputClass} value={invitation.bride_parents || ""} onChange={(e) => onChange("bride_parents", e.target.value)} /></Field>
      <Field label="Nama orang tua pria"><input className={inputClass} value={invitation.groom_parents || ""} onChange={(e) => onChange("groom_parents", e.target.value)} /></Field>
    </div>
  );
}

function StepCouple({ invitation, settings, onChangeSettings }: { invitation: Invitation; settings: CustomSettings["couple"]; onChangeSettings: (key: SectionKey, next: CustomSettings["couple"]) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("couple", next)} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Foto mempelai wanita">
          <ImageField label="Foto mempelai wanita" value={invitation.bride_photo} onChange={(url) => patchField(invitation, "bride_photo", url)} positionX={settings.imagePositionX} positionY={settings.imagePositionY} zoom={settings.zoom} rotate={settings.rotate} onPositionChange={(x, y) => onChangeSettings("couple", { ...settings, imagePositionX: x, imagePositionY: y })} onZoomChange={(z) => onChangeSettings("couple", { ...settings, zoom: z })} onRotateChange={(r) => onChangeSettings("couple", { ...settings, rotate: r })} />
        </Field>
        <Field label="Foto mempelai pria">
          <ImageField label="Foto mempelai pria" value={invitation.groom_photo} onChange={(url) => patchField(invitation, "groom_photo", url)} positionX={invitation.groom_image_position_x} positionY={invitation.groom_image_position_y} zoom={invitation.groom_image_zoom} rotate={invitation.groom_image_rotate} onPositionChange={(x, y) => patchField(invitation, "groom_image_position_x", x)} onZoomChange={(z) => patchField(invitation, "groom_image_zoom", z)} onRotateChange={(r) => patchField(invitation, "groom_image_rotate", r)} />
        </Field>
      </div>
    </>
  );
}

function StepHero({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["hero"]; onChangeSettings: (key: SectionKey, next: CustomSettings["hero"]) => void; onChange: (field: string, value: string) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("hero", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Hero title"><input className={inputClass} value={invitation.hero_title || ""} onChange={(e) => onChange("hero_title", e.target.value)} /></Field>
        <Field label="Hero subtitle"><Textarea className={inputClass} rows={2} value={invitation.hero_subtitle || ""} onChange={(e) => onChange("hero_subtitle", e.target.value)} /></Field>
        <Field label="Cover image">
          <ImageField label="Cover image" value={invitation.cover_image} onChange={(url) => patchField(invitation, "cover_image", url)} positionX={settings.imagePositionX} positionY={settings.imagePositionY} zoom={settings.zoom} rotate={settings.rotate} onPositionChange={(x, y) => onChangeSettings("hero", { ...settings, imagePositionX: x, imagePositionY: y })} onZoomChange={(z) => onChangeSettings("hero", { ...settings, zoom: z })} onRotateChange={(r) => onChangeSettings("hero", { ...settings, rotate: r })} />
        </Field>
      </div>
    </>
  );
}

function StepGreeting({ invitation, onChange }: { invitation: Invitation; onChange: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-3">
      <Field label="Teks sapaan"><Textarea className={inputClass} rows={3} value={invitation.greeting_text || ""} onChange={(e) => onChange("greeting_text", e.target.value)} /></Field>
      <Field label="Nama penerima"><input className={inputClass} value={invitation.recipient_name || ""} onChange={(e) => onChange("recipient_name", e.target.value)} /></Field>
    </div>
  );
}

function StepStory({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["story"]; onChangeSettings: (key: SectionKey, next: CustomSettings["story"]) => void; onChange: (field: string, value: string) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("story", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Judul cerita"><input className={inputClass} value={invitation.story_title || ""} onChange={(e) => onChange("story_title", e.target.value)} /></Field>
        <Field label="Isi cerita"><Textarea className={inputClass} rows={5} value={invitation.story_content || ""} onChange={(e) => onChange("story_content", e.target.value)} /></Field>
      </div>
    </>
  );
}

function StepSchedule({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["schedule"]; onChangeSettings: (key: SectionKey, next: CustomSettings["schedule"]) => void; onChange: (field: string, value: string) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("schedule", next)} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Tanggal"><Input type="date" className={inputClass} value={invitation.event_date || ""} onChange={(e) => onChange("event_date", e.target.value)} /></Field>
        <Field label="Waktu"><input className={inputClass} value={invitation.event_time || ""} onChange={(e) => onChange("event_time", e.target.value)} /></Field>
      </div>
    </>
  );
}

function StepVenue({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["venue"]; onChangeSettings: (key: SectionKey, next: CustomSettings["venue"]) => void; onChange: (field: string, value: string) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("venue", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Nama venue"><input className={inputClass} value={invitation.venue_name || ""} onChange={(e) => onChange("venue_name", e.target.value)} /></Field>
        <Field label="Alamat"><Textarea className={inputClass} rows={2} value={invitation.venue_address || ""} onChange={(e) => onChange("venue_address", e.target.value)} /></Field>
        <Field label="Google Maps URL"><input className={inputClass} value={invitation.google_maps_url || ""} onChange={(e) => onChange("google_maps_url", e.target.value)} /></Field>
      </div>
    </>
  );
}

function StepGallery({ invitation, settings, onChangeSettings, onChangeGallery }: { invitation: Invitation; settings: CustomSettings["gallery"]; onChangeSettings: (key: SectionKey, next: CustomSettings["gallery"]) => void; onChangeGallery: (images: Invitation["gallery_images"]) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("gallery", next)} />
      <div className="mt-3"><GalleryField images={invitation.gallery_images} onChange={onChangeGallery} /></div>
    </>
  );
}

function StepVideo({ invitation, onChange }: { invitation: Invitation; onChange: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-3">
      <Field label="Video URL (YouTube/Vimeo)"><input className={inputClass} value={invitation.video_url || ""} onChange={(e) => onChange("video_url", e.target.value)} /></Field>
      <Field label="Video poster"><ImageField label="Video poster" value={invitation.video_poster || null} onChange={(url) => onChange("video_poster", url ?? "")} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
    </div>
  );
}

function StepGift({ invitation, settings, onChangeSettings, onChangeGifts }: { invitation: Invitation; settings: CustomSettings["gift"]; onChangeSettings: (key: SectionKey, next: CustomSettings["gift"]) => void; onChangeGifts: (gifts: Invitation["gift_accounts"]) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("gift", next)} />
      <div className="mt-3 space-y-2">
        {invitation.gift_accounts.map((gift, index) => (
          <div key={gift.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
            <input className={inputClass} placeholder="Bank" value={gift.bank} onChange={(e) => { const next = [...invitation.gift_accounts]; next[index] = { ...gift, bank: e.target.value }; onChangeGifts(next); }} />
            <input className={inputClass} placeholder="Nomor rekening" value={gift.accountNumber} onChange={(e) => { const next = [...invitation.gift_accounts]; next[index] = { ...gift, accountNumber: e.target.value }; onChangeGifts(next); }} />
            <input className={inputClass} placeholder="Atas nama" value={gift.accountName} onChange={(e) => { const next = [...invitation.gift_accounts]; next[index] = { ...gift, accountName: e.target.value }; onChangeGifts(next); }} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => { const next = [...invitation.gift_accounts, { id: uuid(), bank: "", accountNumber: "", accountName: "" }]; onChangeGifts(next); }}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah rekening
        </Button>
      </div>
    </>
  );
}

function StepMusic({ invitation, settings, onChangeSettings }: { invitation: Invitation; settings: CustomSettings["music"]; onChangeSettings: (key: SectionKey, next: CustomSettings["music"]) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("music", next)} />
      <div className="mt-3 space-y-2">
        <input type="file" accept="audio/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const url = await uploadFile(file); patchField(invitation, "music_url", url); } catch { /* ignore */ } }} className="text-xs" />
        {invitation.music_url && <audio controls src={invitation.music_url} className="w-full text-xs" aria-label="Musik undangan" />}
      </div>
    </>
  );
}

function StepCountdown({ settings, onChangeSettings }: { settings: CustomSettings["countdown"]; onChangeSettings: (key: SectionKey, next: CustomSettings["countdown"]) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("countdown", next)} />
      <div className="mt-3"><p className="text-xs text-muted-foreground">Hitung mundur otomatis berdasarkan tanggal acara di section Jadwal</p></div>
    </>
  );
}

function StepRsvp({ invitation, onChange }: { invitation: Invitation; onChange: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-3">
      <Field label="RSVP aktif">
        <select className={inputClass} value={invitation.rsvp_enabled ? "true" : "false"} onChange={(e) => onChange("rsvp_enabled", e.target.value)}>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      </Field>
    </div>
  );
}

function StepWishes({ invitation, onChange }: { invitation: Invitation; onChange: (field: string, value: string) => void }) {
  return (
    <div className="grid gap-3">
      <Field label="Pesan doa & harapan"><Textarea className={inputClass} rows={4} value={invitation.closing_message || ""} onChange={(e) => onChange("closing_message", e.target.value)} /></Field>
    </div>
  );
}

function StepFunFacts({ invitation, onChangeFacts }: { invitation: Invitation; onChangeFacts: (facts: Invitation["fun_facts"]) => void }) {
  const facts = invitation.fun_facts || [];
  return (
    <div className="grid gap-3">
      <Field label="Tahun bertemu"><input className={inputClass} value={facts[0]?.value || ""} onChange={(e) => onChangeFacts([{ icon: "calendar", label: "Tahun bertemu", value: e.target.value }, ...facts.slice(1)])} /></Field>
      <Field label="Lagu favorit"><input className={inputClass} value={facts[1]?.value || ""} onChange={(e) => onChangeFacts([facts[0] || { icon: "music", label: "", value: "" }, { icon: "music", label: "Lagu favorit", value: e.target.value }, ...facts.slice(2)])} /></Field>
      <Field label="Tempat pertama"><input className={inputClass} value={facts[2]?.value || ""} onChange={(e) => onChangeFacts([...facts.slice(0, 2), { icon: "map", label: "Tempat pertama", value: e.target.value }])} /></Field>
    </div>
  );
}

function StepClosing({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["closing"]; onChangeSettings: (key: SectionKey, next: CustomSettings["closing"]) => void; onChange: (field: string, value: string) => void }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("closing", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Pesan penutup"><Textarea className={inputClass} rows={4} value={invitation.closing_message || ""} onChange={(e) => onChange("closing_message", e.target.value)} /></Field>
        <Field label="Gambar penutup"><ImageField label="Closing image" value={invitation.closing_image || null} onChange={(url) => patchField(invitation, "closing_image", url)} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
        <Field label="QRIS image"><ImageField label="QRIS" value={invitation.qris_image || null} onChange={(url) => patchField(invitation, "qris_image", url)} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
      </div>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="mb-0.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function patchField(invitation: Invitation, field: string, value: unknown) {
  // Handled by parent patch() via queryClient.setQueryData
}
