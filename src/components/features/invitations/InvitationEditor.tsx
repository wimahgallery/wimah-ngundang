"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { Plus, ArrowLeft, ArrowRight, Rocket, Save, Trash2, Eye, FileText, Image, Video, Music, MapPin, Calendar, Users, Gift, ChevronDown, Type } from "lucide-react";
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
import { EVENT_TYPES, RESERVED_SLUGS, normalizeInvitation, type Invitation, type CustomSettings, type SectionKey, type FontSettings, type GalleryLayout } from "@/lib/invitation";
import { TypographyStep } from "./TypographyStep";
import { defaultPreset } from "@/lib/font-library";
import { useInvitation, useSaveInvitation, useDeleteInvitation } from "@/features/invitations/hooks";
import { fetchWishes, flushInvitation } from "@/features/invitations/services/invitationApi";
import { LazyFrame } from "@/components/lazy";
import { GuestWishesList } from "@/components/invitation/shared";
import { isTemplateId, templateMetaById, type TemplateId } from "@/components/invitation/template-registry";
import { uploadFolders } from "@/lib/upload-folders";
import { useMusicTracks } from "@/features/music/hooks";
import { formatDuration } from "@/features/music/services/musicApi";
import { TemplatePicker } from "./TemplatePicker";
import { cn, proxiedMediaSrc } from "@/lib/utils";
import ImageField from "./ImageField";
import GalleryField from "./GalleryField";
import SectionSettingsPanel from "./SectionSettingsPanel";

const inputClass =
  "w-full max-w-[65ch] rounded-md border border-border bg-white px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:py-1.5 md:text-sm";

type FieldChange = (field: string, value: string | number | boolean) => void;

/** Aturan slug sama dengan `invitationCreateSchema` di lib/schemas.ts. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugError(value: string | null | undefined): string | null {
  const slug = (value ?? "").trim();
  if (slug.length < 3) return "Slug minimal 3 karakter";
  if (!SLUG_PATTERN.test(slug)) return "Gunakan huruf kecil, angka, dan tanda hubung";
  if (RESERVED_SLUGS.includes(slug)) return "Slug ini tidak dapat digunakan";
  return null;
}

const STEPS: { key: SectionKey | "font"; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Info", icon: FileText },
  { key: "font", label: "Font", icon: Type },
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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const templateId = invitation?.template_id ?? "";
  const currentTemplate = isTemplateId(templateId) ? templateMetaById[templateId] : templateMetaById.lume;
  const resolvedTemplateId = currentTemplate.id;

  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [previewNonce, setPreviewNonce] = useState(0);
  const revRef = useRef(0);
  /** Slug terakhir yang benar-benar tersimpan — dipakai saat slug di UI sedang
   *  tidak valid (masih diketik) supaya perubahan lain tetap bisa disimpan. */
  const lastSavedSlugRef = useRef(slug);
  const dirtyRef = useRef(false);
  /** Fungsi flush terbaru; dipanggil saat komponen unmount (navigasi client-side
   *  tidak memicu `beforeunload`/`pagehide`, jadi debounce 1,5 detik bisa hilang). */
  const flushRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  const saveAsyncRef = useRef(saveMutation.mutateAsync);
  useEffect(() => {
    saveAsyncRef.current = saveMutation.mutateAsync;
  }, [saveMutation.mutateAsync]);

  /**
   * `patch` memakai functional update — panggilan berurutan dalam satu handler
   * (mis. mengatur posisi foto X lalu Y) saling melengkapi, bukan menimpa.
   */
  const patch = useCallback(
    (partial: Partial<Invitation> | ((prev: Invitation) => Partial<Invitation>)) => {
      if (!invitation) return;
      revRef.current += 1;
      setDirty(true);
      setSaveStatus("idle");
      queryClient.setQueryData<Invitation>(["invitation", slug], (prev) => {
        const base = prev ?? invitation;
        return { ...base, ...(typeof partial === "function" ? partial(base) : partial) };
      });
    },
    [invitation, slug, queryClient],
  );

  const patchSettings = useCallback(
    (key: SectionKey, next: CustomSettings[SectionKey] | ((prev: CustomSettings[SectionKey]) => CustomSettings[SectionKey])) => {
      // Functional update: handler yang dipanggil berurutan dalam satu tick
      // (mis. onZoomChange lalu onRotateChange saat applyCrop) tetap menumpuk,
      // bukan membangun dari snapshot props yang sama.
      patch((prev) => ({
        custom_settings: {
          ...prev.custom_settings,
          [key]: typeof next === "function" ? next(prev.custom_settings[key]) : next,
        },
      }));
    },
    [patch],
  );

  /** Snapshot terkini dari cache — bukan closure basi saat callback dieksekusi. */
  const currentInvitation = useCallback(
    () => queryClient.getQueryData<Invitation>(["invitation", slug]) ?? invitation ?? null,
    [queryClient, slug, invitation],
  );

  /**
   * Semua simpanan dirantai (chained) supaya autosave tidak pernah menimpa
   * publish — atau sebaliknya — di server.
   */
  const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());

  const doSave = useCallback(
    (extra: Partial<Invitation> = {}): Promise<void> => {
      const task = async () => {
        const current = currentInvitation();
        if (!current) return;
        // Slug sedang tidak valid (masih diketik) → tahan pakai slug terakhir
        // yang sah supaya publish/draft/autosave tidak pernah menulis slug sampah,
        // dan perubahan field lain tetap tersimpan.
        const typedSlug = (current.slug ?? "").trim();
        const safeSlug = slugError(typedSlug) ? lastSavedSlugRef.current : typedSlug;
        const sent = { ...current, ...extra, slug: safeSlug };

        // `extra` (publish/draft) harus ikut masuk ke cache. Kalau tidak, edit
        // yang masuk selama request berjalan membuat autosave berikutnya mengirim
        // `is_published` lama dan membatalkan publish diam-diam.
        if (Object.keys(extra).length > 0) {
          queryClient.setQueryData<Invitation>(["invitation", slug], (prev) => ({
            ...(prev ?? current),
            ...extra,
          }));
        }

        const rev = revRef.current;
        setSaveStatus("saving");
        try {
          const result = await saveAsyncRef.current(sent);
          const next = normalizeInvitation(result);
          const changedWhileSaving = revRef.current !== rev;

          // Jawapan server adalah kebenaran, KECUALI field yang memang berubah
          // di client selama request berlangsung — kalau dibuang, publish/renami
          // bisa tertimpa oleh autosave yang mengirim snapshot basi.
          const local = queryClient.getQueryData<Invitation>(["invitation", slug]) ?? next;
          const merged = { ...next } as Invitation;
          for (const key of Object.keys(sent) as (keyof Invitation)[]) {
            try {
              if (JSON.stringify(local[key]) !== JSON.stringify(sent[key])) {
                (merged as unknown as Record<string, unknown>)[key] = local[key];
              }
            } catch {
              /* nilai tak ter-serialisasi — pakai versi server */
            }
          }

          queryClient.setQueryData<Invitation>(["invitation", slug], merged);
          lastSavedSlugRef.current = (next.slug || current.slug || slug).trim();
          setDirty(changedWhileSaving);
          setSaveStatus(changedWhileSaving ? "idle" : "saved");

          if (next.slug && next.slug !== slug) {
            // Pindahkan cache ke key baru memakai `merged`, bukan `next`, supaya
            // edit yang masuk saat rename tidak hilang setelah redirect.
            queryClient.setQueryData<Invitation>(["invitation", next.slug], merged);
            router.replace(`/dashboard/invitations/${next.slug}`);
          }
        } catch (e) {
          // Varian "error" supaya indikator header tidak terjebak di
          // "Belum tersimpan" (amber) saat simpanan memang gagal.
          if (revRef.current === rev) setSaveStatus("error");
          throw e;
        }
      };
      const run = saveChainRef.current.then(task, task);
      saveChainRef.current = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
    [currentInvitation, slug, queryClient, router],
  );

  /**
   * Auto-save. Slug IKUT tersimpan (tidak lagi dipaksa balik ke slug lama) supaya
   * perubahan slug benar-benar masuk ke database. Kalau slug sedang tidak valid,
   * `doSave` otomatis menahannya dengan slug terakhir yang sah — simpanan untuk
   * field lain tetap jalan.
   */
  useEffect(() => {
    if (!invitation || !dirty) return;
    const timer = setTimeout(() => {
      // Snapshot dibaca di dalam task (bukan dari closure) sehingga selalu
      // versi cache terbaru; doSave menunggu antrian simpanan sebelumnya.
      void doSave().catch(() => {
        /* error ditampilkan lewat saveMutation.error */
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [invitation, dirty, doSave]);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = setTimeout(() => setPreviewNonce((n) => n + 1), 2000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  /**
   * Auto-save berdebounce 1,5 detik — kalau tab ditutup sebelum itu, perubahan
   * hilang diam-diam. `flushInvitation` memakai `fetch keepalive` supaya tetap
   * terkirim walau halaman sudah pergi, dan dialog native dipakai sebagai
   * jaring pengaman kalau request itu ternyata tidak jalan.
   */
  useEffect(() => {
    if (!dirty || !invitation) return;

    const flush = () => {
      if (!dirtyRef.current) return;
      const current =
        queryClient.getQueryData<Invitation>(["invitation", slug]) ?? invitation;
      const payload = slugError((current.slug ?? "").trim())
        ? { ...current, slug: lastSavedSlugRef.current }
        : current;
      flushInvitation(slug, payload as unknown as Record<string, unknown>);
    };
    flushRef.current = flush;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      flush();
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", flush);
    };
  }, [dirty, invitation, slug, queryClient]);

  /**
   * Navigasi client-side (tombol Kembali / Preview) tidak memicu `beforeunload`
   * maupun `pagehide` — tanpa flush ini, edit yang masih dalam jendela debounce
   * 1,5 detik hilang begitu saja saat komponen dilepas.
   */
  useEffect(() => () => {
    flushRef.current?.();
  }, []);

  const handlePublish = async () => {
    try {
      await doSave({ is_published: true });
      setPublishDialogOpen(false);
    } catch {
      /* error ditampilkan lewat saveMutation.error */
    }
  };

  const handleDraft = async () => {
    try {
      await doSave({ is_published: false });
    } catch {
      /* error ditampilkan lewat saveMutation.error */
    }
  };

  /**
   * Preview dulu menyimpan perubahan yang masih pending — kalau slug belum pernah
   * tersimpan (atau tidak valid), navigasi membuka 404 karena server `notFound()`.
   */
  const handlePreview = async () => {
    const typedSlug = (invitation?.slug ?? "").trim();
    const valid = !slugError(typedSlug);
    if (dirtyRef.current && valid) {
      try {
        await doSave();
      } catch {
        /* gagal simpan — jangan buka preview yang kemungkinan 404 */
        return;
      }
      router.push(`/preview/invitation/${lastSavedSlugRef.current}`);
      return;
    }
    router.push(
      `/preview/invitation/${valid ? typedSlug : lastSavedSlugRef.current}`,
    );
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus undangan /${slug}?`)) return;
    try {
      await deleteMutation.mutateAsync(slug);
      router.push("/dashboard/invitations");
    } catch {
      /* error ditampilkan lewat deleteMutation.error */
    }
  };

  const onChangeField = useCallback((field: string, value: string | number | boolean) => {
    const next = field === "rsvp_enabled" && typeof value === "string" ? value === "true" : value;
    patch({ [field]: next } as Partial<Invitation>);
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

  const onChangeMilestones = useCallback((story_milestones: NonNullable<Invitation["story_milestones"]>) => {
    patch({ story_milestones });
  }, [patch]);

  const onChangeEvents = useCallback((events: NonNullable<Invitation["events"]>) => {
    patch({ events });
  }, [patch]);

  const onChangeFont = useCallback((font: FontSettings) => {
    if (!invitation) return;
    patch({ custom_settings: { ...invitation.custom_settings, font } });
  }, [invitation, patch]);

  /**
   * Template = visual preset utuh. Saat ganti template, tipografi dikembalikan
   * ke default template BARU — font lama tidak boleh terbawa (stale).
   */
  const handleTemplateChange = useCallback(
    (id: TemplateId) => {
      if (!invitation) return;
      const nextFont = defaultPreset(id);
      patch({
        template_id: id,
        custom_settings: { ...invitation.custom_settings, font: { ...nextFont } },
      });
    },
    [invitation, patch],
  );

  const ActiveIcon = STEPS[activeStep].icon;
  const stepTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const stepContent = useMemo(() => {
    const s = invitation?.custom_settings;
    if (!s) return null;
    switch (STEPS[activeStep].key) {
      case "info": return <StepInfo invitation={invitation!} onChange={onChangeField} />;
      case "font": return <TypographyStep templateId={resolvedTemplateId} font={invitation.custom_settings.font ?? { heading: null, body: null, accent: null }} onChange={onChangeFont} />;
      case "couple": return <StepCouple invitation={invitation!} settings={s.couple} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "hero": return <StepHero invitation={invitation!} settings={s.hero} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "greeting": return <StepGreeting invitation={invitation!} settings={s.preamble} greetingSettings={s.greeting} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "story": return <StepStory invitation={invitation!} settings={s.story} onChangeSettings={patchSettings} onChange={onChangeField} onChangeMilestones={onChangeMilestones} />;
      case "schedule": return <StepSchedule invitation={invitation!} settings={s.schedule} onChangeSettings={patchSettings} onChange={onChangeField} onChangeEvents={onChangeEvents} />;
      case "venue": return <StepVenue invitation={invitation!} settings={s.venue} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "gallery": return <StepGallery invitation={invitation!} settings={s.gallery} onChangeSettings={patchSettings} onChangeGallery={onChangeGallery} />;
      case "video": return <StepVideo invitation={invitation!} onChange={onChangeField} />;
      case "gift": return <StepGift invitation={invitation!} settings={s.gift} onChangeSettings={patchSettings} onChangeGifts={onChangeGifts} />;
      case "music": return <StepMusic invitation={invitation!} settings={s.music} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "countdown": return <StepCountdown settings={s.countdown} onChangeSettings={patchSettings} />;
      case "rsvp": return <StepRsvp invitation={invitation!} settings={s.rsvp} onChangeSettings={patchSettings} onChange={onChangeField} />;
      case "wishes": return <StepWishes slug={invitation!.slug} settings={s.wishes} onChangeSettings={patchSettings} />;
      case "funfacts": return <StepFunFacts invitation={invitation!} onChangeFacts={onChangeFunFacts} />;
      case "closing": return <StepClosing invitation={invitation!} settings={s.closing} onChangeSettings={patchSettings} onChange={onChangeField} />;
      default: return null;
    }
  }, [activeStep, invitation, resolvedTemplateId, patchSettings, onChangeField, onChangeFont, onChangeGifts, onChangeFunFacts, onChangeGallery, onChangeMilestones, onChangeEvents]);

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
    <div className="flex flex-col gap-6 py-1 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1 space-y-3">
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
          <Button variant="outline" size="sm" className="min-h-11 px-3" onClick={() => void handlePreview()}>
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
          <span role="status" aria-live="polite" className="flex min-h-11 items-center px-1 text-xs font-medium">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Menyimpan…
              </span>
            ) : saveStatus === "error" ? (
              <span className="text-red-600">Gagal menyimpan</span>
            ) : dirty ? (
              <span className="text-amber-600">Belum tersimpan</span>
            ) : saveStatus === "saved" ? (
              <span className="text-green-600">Tersimpan ✓</span>
            ) : null}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-xs text-muted-foreground">Template:</Label>
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 gap-2 px-3"
          onClick={() => setTemplateDialogOpen(true)}
        >
          <span
            aria-hidden
            className="h-3 w-3 rounded-full ring-1 ring-black/10"
            style={{ background: currentTemplate.colors.hero }}
          />
          {currentTemplate.name}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <span className="hidden max-w-[40ch] truncate text-xs text-muted-foreground sm:inline">
          {currentTemplate.description}
        </span>
      </div>

      {saveMutation.isError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Gagal menyimpan perubahan.</p>
          <p className="mt-1 break-words">{(saveMutation.error as Error).message}</p>
          {/column|does not exist|schema/i.test((saveMutation.error as Error).message) && (
            <p className="mt-1">
              Kolom belum ada di database — jalankan isi file <code className="font-medium">supabase/invitations.sql</code> di
              Supabase SQL Editor, lalu simpan lagi.
            </p>
          )}
        </div>
      )}

      {deleteMutation.isError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Gagal menghapus undangan.</p>
          <p className="mt-1 break-words">{(deleteMutation.error as Error).message}</p>
        </div>
      )}

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

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilih Template</DialogTitle>
          </DialogHeader>
          <TemplatePicker
            name="editor-template-picker"
            value={invitation.template_id || "lume"}
            onChange={handleTemplateChange}
          />
          <DialogFooter>
            <Button size="sm" className="min-h-11 px-4" onClick={() => setTemplateDialogOpen(false)}>
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <aside className="hidden w-[400px] shrink-0 xl:block">
        <div className="sticky top-4 space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">Preview undangan</p>
            <p className="text-[11px] text-muted-foreground">sinkron ±2 detik setelah simpan</p>
          </div>
          <div
            className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
            style={{ height: "min(75vh, 760px)" }}
          >
            <LazyFrame
              key={previewNonce}
              src={`/preview/invitation/${slug}?v=${previewNonce}&gate=0`}
              title="Preview undangan"
              className="h-full"
              fallbackClassName="bg-background"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function StepInfo({ invitation, onChange }: { invitation: Invitation; onChange: FieldChange }) {
  const slugIssue = slugError(invitation.slug);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Slug" className="sm:col-span-2">
        <input
          className={cn(inputClass, slugIssue && "border-red-400 focus-visible:ring-red-400/60")}
          value={invitation.slug || ""}
          onChange={(e) => onChange("slug", e.target.value)}
          placeholder="mis. nilam-dodi"
        />
        <span className={cn("mt-1 block text-xs", slugIssue ? "text-red-600" : "text-muted-foreground")}>
          {slugIssue ?? `Tautan undangan: /${invitation.slug}`}
        </span>
      </Field>
      <Field label="Jenis acara">
        <select className={inputClass} value={invitation.event_type || ""} onChange={(e) => onChange("event_type", e.target.value)}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Judul acara" className="sm:col-span-2"><input className={inputClass} value={invitation.event_title || ""} onChange={(e) => onChange("event_title", e.target.value)} /></Field>
      <Field label="Nama mempelai pria"><input className={inputClass} value={invitation.groom_name || ""} onChange={(e) => onChange("groom_name", e.target.value)} /></Field>
      <Field label="Nama mempelai wanita"><input className={inputClass} value={invitation.bride_name || ""} onChange={(e) => onChange("bride_name", e.target.value)} /></Field>
      <Field label="Panggilan pria"><input className={inputClass} value={invitation.groom_nickname || ""} onChange={(e) => onChange("groom_nickname", e.target.value)} /></Field>
      <Field label="Panggilan wanita"><input className={inputClass} value={invitation.bride_nickname || ""} onChange={(e) => onChange("bride_nickname", e.target.value)} /></Field>
      <Field label="Nama orang tua pria"><input className={inputClass} value={invitation.groom_parents || ""} onChange={(e) => onChange("groom_parents", e.target.value)} /></Field>
      <Field label="Nama orang tua wanita"><input className={inputClass} value={invitation.bride_parents || ""} onChange={(e) => onChange("bride_parents", e.target.value)} /></Field>
    </div>
  );
}



function StepCouple({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["couple"]; onChangeSettings: (key: SectionKey, next: CustomSettings["couple"] | ((prev: CustomSettings["couple"]) => CustomSettings["couple"])) => void; onChange: FieldChange }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("couple", next)} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Foto mempelai pria">
          <ImageField label="Foto mempelai pria" folder={uploadFolders.couple} value={invitation.groom_photo} onChange={(url) => onChange("groom_photo", url ?? "")} positionX={invitation.groom_image_position_x} positionY={invitation.groom_image_position_y} zoom={invitation.groom_image_zoom} rotate={invitation.groom_image_rotate} onPositionChange={(x, y) => { onChange("groom_image_position_x", x); onChange("groom_image_position_y", y); }} onZoomChange={(z) => onChange("groom_image_zoom", z)} onRotateChange={(r) => onChange("groom_image_rotate", r)} />
        </Field>
        <Field label="Foto mempelai wanita">
          <ImageField label="Foto mempelai wanita" folder={uploadFolders.couple} value={invitation.bride_photo} onChange={(url) => onChange("bride_photo", url ?? "")} positionX={settings.imagePositionX} positionY={settings.imagePositionY} zoom={settings.zoom} rotate={settings.rotate} onPositionChange={(x, y) => onChangeSettings("couple", (prev) => ({ ...prev, imagePositionX: x, imagePositionY: y }))} onZoomChange={(z) => onChangeSettings("couple", (prev) => ({ ...prev, zoom: z }))} onRotateChange={(r) => onChangeSettings("couple", (prev) => ({ ...prev, rotate: r }))} />
        </Field>
      </div>
    </>
  );
}

function StepHero({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["hero"]; onChangeSettings: (key: SectionKey, next: CustomSettings["hero"] | ((prev: CustomSettings["hero"]) => CustomSettings["hero"])) => void; onChange: FieldChange }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("hero", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Hero title"><input className={inputClass} value={invitation.hero_title || ""} onChange={(e) => onChange("hero_title", e.target.value)} /></Field>
        <Field label="Hero subtitle"><Textarea className={inputClass} rows={2} value={invitation.hero_subtitle || ""} onChange={(e) => onChange("hero_subtitle", e.target.value)} /></Field>
        <Field label="Cover image">
          <ImageField label="Cover image" folder={uploadFolders.hero} value={invitation.cover_image} onChange={(url) => onChange("cover_image", url ?? "")} positionX={settings.imagePositionX} positionY={settings.imagePositionY} zoom={settings.zoom} rotate={settings.rotate} onPositionChange={(x, y) => onChangeSettings("hero", (prev) => ({ ...prev, imagePositionX: x, imagePositionY: y }))} onZoomChange={(z) => onChangeSettings("hero", (prev) => ({ ...prev, zoom: z }))} onRotateChange={(r) => onChangeSettings("hero", (prev) => ({ ...prev, rotate: r }))} />
        </Field>
      </div>
    </>
  );
}

function StepGreeting({
  invitation,
  settings,
  greetingSettings,
  onChangeSettings,
  onChange,
}: {
  invitation: Invitation;
  settings: CustomSettings["preamble"];
  greetingSettings: CustomSettings["greeting"];
  onChangeSettings: (key: SectionKey, next: CustomSettings[SectionKey]) => void;
  onChange: FieldChange;
}) {
  return (
    <div className="grid gap-3">
      <Field label="Teks sapaan"><Textarea className={inputClass} rows={3} value={invitation.greeting_text || ""} onChange={(e) => onChange("greeting_text", e.target.value)} /></Field>
      <Field label="Kata pembuka (sebelum detail mempelai)">
        <Textarea
          className={inputClass}
          rows={4}
          placeholder="Dengan penuh rasa syukur ke hadirat Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan anak-anak kami…"
          value={settings.text || ""}
          onChange={(e) =>
            onChangeSettings("preamble", {
              ...settings,
              text: e.target.value.trim() ? e.target.value : null,
            })
          }
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        Diisi = tampil setelah kartu judul (nama + tanggal), tepat di atas foto couple. Dikosongkan = teksnya dilepas,
        foto couple tetap tampil.
      </p>
      <SectionSettingsPanel
        label="Section kartu judul & foto (layar pertama setelah sampul)"
        value={greetingSettings}
        onChange={(next) => onChangeSettings("greeting", next)}
      />
      <SectionSettingsPanel
        label="Paragraf kata pembuka"
        value={settings}
        onChange={(next) => onChangeSettings("preamble", next)}
      />
      <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2.5">
        <p className="text-xs text-muted-foreground">
          Nama penerima tampil otomatis dari link tamu — tambahkan{" "}
          <code className="font-medium text-foreground">?to=NamaTamu</code> di akhir URL, misal{" "}
          <code className="font-medium text-foreground">/{invitation.slug}?to=Wisnu</code>. Tanpa parameter itu, tampil
          “Tamu Undangan”.
        </p>
      </div>
    </div>
  );
}

function StepStory({ invitation, settings, onChangeSettings, onChange, onChangeMilestones }: { invitation: Invitation; settings: CustomSettings["story"]; onChangeSettings: (key: SectionKey, next: CustomSettings["story"]) => void; onChange: FieldChange; onChangeMilestones: (milestones: NonNullable<Invitation["story_milestones"]>) => void }) {
  const milestones = invitation.story_milestones ?? [];

  const updateMilestone = (index: number, partial: Partial<(typeof milestones)[number]>) => {
    onChangeMilestones(milestones.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  };

  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("story", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Judul cerita"><input className={inputClass} value={invitation.story_title || ""} onChange={(e) => onChange("story_title", e.target.value)} /></Field>
        <Field label="Isi cerita"><Textarea className={inputClass} rows={5} value={invitation.story_content || ""} onChange={(e) => onChange("story_content", e.target.value)} /></Field>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-foreground">Bagaimana kami bertemu &amp; jatuh cinta</p>
            <p className="text-xs text-muted-foreground">Ditampilkan sebagai babak cerita. Kosongkan untuk memakai “Isi cerita” di atas.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onChangeMilestones([...milestones, { id: uuid(), title: "", date: "", description: "", image: null }])}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah babak
          </Button>
        </div>

        {milestones.map((item, index) => (
          <div key={item.id || `milestone-${index}`} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} placeholder="Judul babak (mis. Pertemuan yang Tak Terduga)" value={item.title} onChange={(e) => updateMilestone(index, { title: e.target.value })} />
              <input type="date" className={inputClass} value={item.date || ""} onChange={(e) => updateMilestone(index, { date: e.target.value })} />
            </div>
            <Textarea className={inputClass} rows={4} placeholder="Ceritakan babak ini..." value={item.description} onChange={(e) => updateMilestone(index, { description: e.target.value })} />
            <ImageField label="Foto babak (opsional)" aspect={4 / 5} value={item.image ?? null} onChange={(url) => updateMilestone(index, { image: url || null })} />
            <div>
              <button type="button" className="min-h-10 rounded-lg px-2 text-xs text-red-500" onClick={() => onChangeMilestones(milestones.filter((_, i) => i !== index))}>
                Hapus babak
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StepSchedule({ invitation, settings, onChangeSettings, onChange, onChangeEvents }: { invitation: Invitation; settings: CustomSettings["schedule"]; onChangeSettings: (key: SectionKey, next: CustomSettings["schedule"]) => void; onChange: FieldChange; onChangeEvents: (events: NonNullable<Invitation["events"]>) => void }) {
  const events = invitation.events ?? [];

  const updateEvent = (index: number, partial: Partial<(typeof events)[number]>) => {
    onChangeEvents(events.map((event, i) => (i === index ? { ...event, ...partial } : event)));
  };

  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("schedule", next)} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Tanggal"><Input type="date" className={inputClass} value={invitation.event_date || ""} onChange={(e) => onChange("event_date", e.target.value)} /></Field>
        <Field label="Waktu"><input className={inputClass} placeholder="15.00 WITA – Selesai" value={invitation.event_time || ""} onChange={(e) => onChange("event_time", e.target.value)} /></Field>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-foreground">Agenda acara</p>
            <p className="text-xs text-muted-foreground">Nama acara, tanggal, dan lokasi per sesi (mis. Resepsi, Memadik). Kosongkan untuk memakai tanggal &amp; venue utama di atas.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onChangeEvents([...events, { id: uuid(), name: "", date: invitation.event_date || "", time: "", location: "", address: "", mapsUrl: "" }])}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah agenda
          </Button>
        </div>

        {events.map((event, index) => (
          <div key={event.id || index} className="grid gap-2 rounded-lg border border-border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} placeholder="Nama agenda (mis. Resepsi)" value={event.name} onChange={(e) => updateEvent(index, { name: e.target.value })} />
              <input type="date" className={inputClass} value={event.date || ""} onChange={(e) => updateEvent(index, { date: e.target.value })} />
              <input className={inputClass} placeholder="Waktu (mis. 15.00 WITA – Selesai)" value={event.time || ""} onChange={(e) => updateEvent(index, { time: e.target.value })} />
              <input className={inputClass} placeholder="Nama lokasi" value={event.location || ""} onChange={(e) => updateEvent(index, { location: e.target.value })} />
            </div>
            <Textarea className={inputClass} rows={2} placeholder="Alamat lengkap" value={event.address || ""} onChange={(e) => updateEvent(index, { address: e.target.value })} />
            <input className={inputClass} placeholder="Google Maps URL" value={event.mapsUrl || ""} onChange={(e) => updateEvent(index, { mapsUrl: e.target.value })} />
            <div>
              <button type="button" className="min-h-10 rounded-lg px-2 text-xs text-red-500" onClick={() => onChangeEvents(events.filter((_, i) => i !== index))}>
                Hapus agenda
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StepVenue({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["venue"]; onChangeSettings: (key: SectionKey, next: CustomSettings["venue"]) => void; onChange: FieldChange }) {
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

const GALLERY_LAYOUTS: { value: GalleryLayout; label: string; hint: string }[] = [
  { value: "grid", label: "Grid seragam", hint: "Semua foto bentuk sama — kolom & rasio bebas diatur" },
  { value: "hero", label: "Hero landscape", hint: "Foto pertama melintang penuh, sisanya tersusun di bawah" },
  { value: "mosaic", label: "Mozaik", hint: "Tinggi berselang-seling, kesan masonry" },
];

function GalleryLayoutWireframe({ value }: { value: GalleryLayout }) {
  const cell = "rounded-[2px] bg-current opacity-45";
  if (value === "hero") {
    return (
      <span className="flex w-full flex-col gap-1" aria-hidden>
        <span className={cn("h-4 w-full", cell)} />
        <span className="grid grid-cols-3 gap-1">
          <span className={cn("h-3", cell)} />
          <span className={cn("h-3", cell)} />
          <span className={cn("h-3", cell)} />
        </span>
      </span>
    );
  }
  if (value === "mosaic") {
    return (
      <span className="flex w-full gap-1" aria-hidden>
        <span className="flex flex-1 flex-col gap-1">
          <span className={cn("h-5", cell)} />
          <span className={cn("h-3", cell)} />
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className={cn("h-3", cell)} />
          <span className={cn("h-5", cell)} />
        </span>
      </span>
    );
  }
  return (
    <span className="grid w-full grid-cols-3 gap-1" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={cn("h-3", cell)} />
      ))}
    </span>
  );
}

const GALLERY_ASPECTS: { value: string; label: string }[] = [
  { value: "1/1", label: "1:1" },
  { value: "4/5", label: "4:5" },
  { value: "3/4", label: "3:4" },
  { value: "4/3", label: "4:3" },
  { value: "3/2", label: "3:2" },
  { value: "16/9", label: "16:9" },
  { value: "9/16", label: "9:16" },
];

const clampColumns = (value: unknown, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(8, Math.max(1, n)) : fallback;
};

function parseAspectInput(value: string): [string, string] {
  const match = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(String(value).trim());
  return match ? [match[1], match[2]] : ["1", "1"];
}

function ColumnStepper({ label, value, onDecrement, onIncrement }: { label: string; value: number; onDecrement: () => void; onIncrement: () => void }) {
  const btnClass = "grid h-7 w-7 place-items-center rounded border border-border text-muted-foreground transition hover:text-foreground disabled:opacity-40";
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-2 py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">
        <button type="button" onClick={onDecrement} disabled={value <= 1} aria-label={`Kurangi kolom ${label}`} className={btnClass}>−</button>
        <span className="w-6 text-center text-xs font-semibold tabular-nums text-foreground">{value}</span>
        <button type="button" onClick={onIncrement} disabled={value >= 8} aria-label={`Tambah kolom ${label}`} className={btnClass}>+</button>
      </span>
    </div>
  );
}

function AspectField({ label, value, onCommit }: { label: string; value: string; onCommit: (value: string) => void }) {
  const [w, h] = parseAspectInput(value);
  const commit = (nw: string, nh: string) => {
    const a = Number(nw);
    const b = Number(nh);
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0 && a <= 100 && b <= 100) {
      onCommit(`${a}/${b}`);
    }
  };
  const inputClass = "h-7 w-14 rounded-md border border-border bg-white px-1.5 text-center text-[11px] tabular-nums";
  return (
    <div className="grid gap-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {GALLERY_ASPECTS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onCommit(opt.value)}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <input type="number" min={1} max={100} step={0.1} aria-label={`${label} — lebar rasio`} value={w} onChange={(e) => commit(e.target.value, h)} onBlur={(e) => { if (!(Number(e.currentTarget.value) > 0)) e.currentTarget.value = w; }} className={inputClass} />
          <span>:</span>
          <input type="number" min={1} max={100} step={0.1} aria-label={`${label} — tinggi rasio`} value={h} onChange={(e) => commit(w, e.target.value)} onBlur={(e) => { if (!(Number(e.currentTarget.value) > 0)) e.currentTarget.value = h; }} className={inputClass} />
        </span>
        <span className="text-[11px] text-muted-foreground/70">atau tulis rasio sendiri</span>
      </div>
    </div>
  );
}

function StepGallery({ invitation, settings, onChangeSettings, onChangeGallery }: { invitation: Invitation; settings: CustomSettings["gallery"]; onChangeSettings: (key: SectionKey, next: CustomSettings["gallery"]) => void; onChangeGallery: (images: Invitation["gallery_images"]) => void }) {
  const layout = settings.layout ?? "grid";
  const setLayout = (next: GalleryLayout) =>
    onChangeSettings("gallery", { ...settings, layout: next });
  const setNumber = (key: "columnsMobile" | "columnsTablet" | "columnsDesktop", value: number) =>
    onChangeSettings("gallery", { ...settings, [key]: value });
  const columns: { key: "columnsMobile" | "columnsTablet" | "columnsDesktop"; label: string; fallback: number }[] = [
    { key: "columnsMobile", label: "Ponsel", fallback: 2 },
    { key: "columnsTablet", label: "Tablet ≥768px", fallback: 3 },
    { key: "columnsDesktop", label: "Desktop ≥1200px", fallback: 4 },
  ];
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("gallery", { ...settings, ...next })} />
      <div className="mt-3 grid gap-3 rounded-xl bg-background p-3">
        <p className="text-xs font-medium text-foreground">Tata letak galeri</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {GALLERY_LAYOUTS.map((opt) => {
            const active = layout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLayout(opt.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border p-3 text-left transition",
                  active
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <GalleryLayoutWireframe value={opt.value} />
                <span className={cn("text-xs font-medium", active && "text-foreground")}>
                  {opt.label}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">{opt.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-2 border-t border-border pt-3">
          <div>
            <p className="text-xs font-medium text-foreground">Jumlah kolom</p>
            <p className="text-[11px] text-muted-foreground">Bebas 1–8 kolom, diatur terpisah per ukuran layar (responsif).</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {columns.map(({ key, label, fallback }) => {
              const value = clampColumns(settings[key], fallback);
              return (
                <ColumnStepper
                  key={key}
                  label={label}
                  value={value}
                  onDecrement={() => setNumber(key, Math.max(1, value - 1))}
                  onIncrement={() => setNumber(key, Math.min(8, value + 1))}
                />
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-3">
          <div>
            <p className="text-xs font-medium text-foreground">Bentuk foto</p>
            <p className="text-[11px] text-muted-foreground">Pilih rasio cepat atau tulis rasio bebas (lebar:tinggi).</p>
          </div>
          {layout === "hero" && (
            <AspectField
              label="Foto pertama (hero)"
              value={settings.heroAspect ?? "16/9"}
              onCommit={(v) => onChangeSettings("gallery", { ...settings, heroAspect: v })}
            />
          )}
          <AspectField
            label={
              layout === "mosaic"
                ? "Rasio dasar (sel berselang-seling)"
                : layout === "hero"
                  ? "Foto sisanya"
                  : "Semua foto"
            }
            value={settings.aspect ?? "1/1"}
            onCommit={(v) => onChangeSettings("gallery", { ...settings, aspect: v })}
          />
        </div>
      </div>
      <div className="mt-3"><GalleryField folder={uploadFolders.gallery} images={invitation.gallery_images} onChange={onChangeGallery} /></div>
    </>
  );
}

function StepVideo({ invitation, onChange }: { invitation: Invitation; onChange: FieldChange }) {
  return (
    <div className="grid gap-3">
      <Field label="Video URL (YouTube/Vimeo)"><input className={inputClass} value={invitation.video_url || ""} onChange={(e) => onChange("video_url", e.target.value)} /></Field>
      <Field label="Video poster"><ImageField label="Video poster" aspect={16 / 9} folder={uploadFolders.videoPoster} value={invitation.video_poster || null} onChange={(url) => onChange("video_poster", url ?? "")} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
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

function StepMusic({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["music"]; onChangeSettings: (key: SectionKey, next: CustomSettings["music"]) => void; onChange: FieldChange }) {
  const { data: tracks, isLoading, error, refetch } = useMusicTracks();
  const list = tracks ?? [];
  const current = invitation.music_url || "";
  const currentMissing = current !== "" && !list.some((track) => track.url === current);
  // Pratinjau: URL asli dulu, jatuh ke proxy `/api/media` bila diblokir jaringan.
  const [audioProxy, setAudioProxy] = useState(false);
  const [prevMusicUrl, setPrevMusicUrl] = useState(current);
  if (prevMusicUrl !== current) {
    setPrevMusicUrl(current);
    setAudioProxy(false);
  }
  const audioSrc = audioProxy ? proxiedMediaSrc(current) : current;

  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("music", next)} />
      <div className="mt-3 space-y-3">
        <Field label="Pilih musik">
          <select
            className={inputClass}
            value={current}
            disabled={isLoading}
            onChange={(e) => onChange("music_url", e.target.value)}
          >
            <option value="">Tanpa musik</option>
            {currentMissing && (
              <option value={current}>Musik terpilih saat ini (belum ada di daftar)</option>
            )}
            {list.map((track) => (
              <option key={track.id} value={track.url}>
                {track.name}
                {track.duration_seconds ? ` — ${formatDuration(track.duration_seconds)}` : ""}
              </option>
            ))}
          </select>
        </Field>

        {isLoading && <p className="text-xs text-muted-foreground">Memuat daftar musik…</p>}

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p>Gagal memuat daftar musik.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 rounded-full border border-red-300 px-3 py-1 transition hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!isLoading && !error && list.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-background p-4 text-xs text-muted-foreground">
            Belum ada musik di daftar. Unggah lagunya lewat{" "}
            <Link href="/dashboard/music" className="text-foreground underline underline-offset-2">
              menu Musik
            </Link>
            , lalu lagu itu akan muncul di pilihan ini.
          </p>
        )}

        {current && (
          <audio
            controls
            src={audioSrc}
            onError={() => {
              if (!audioProxy && proxiedMediaSrc(current) !== current) setAudioProxy(true);
            }}
            className="w-full text-xs"
            aria-label="Pratinjau musik terpilih"
          />
        )}
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

function StepRsvp({
  invitation,
  settings,
  onChangeSettings,
  onChange,
}: {
  invitation: Invitation;
  settings: CustomSettings["rsvp"];
  onChangeSettings: (key: SectionKey, next: CustomSettings["rsvp"]) => void;
  onChange: FieldChange;
}) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("rsvp", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="RSVP aktif">
          <select className={inputClass} value={invitation.rsvp_enabled ? "true" : "false"} onChange={(e) => onChange("rsvp_enabled", e.target.value)}>
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </Field>
        <p className="text-xs text-muted-foreground">
          Saat aktif, tamu dapat mengonfirmasi kehadiran lewat section “Konfirmasi Kehadiran” di undangan.
        </p>
      </div>
    </>
  );
}

function StepWishes({
  slug,
  settings,
  onChangeSettings,
}: {
  slug: string;
  settings: CustomSettings["wishes"];
  onChangeSettings: (key: SectionKey, next: CustomSettings["wishes"]) => void;
}) {
  const { data: wishes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["wishes", slug],
    queryFn: () => fetchWishes(slug),
  });

  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("wishes", next)} />
      <div className="mt-3 space-y-3">
        <p className="text-xs text-muted-foreground">
          Tamu mengirim doa &amp; ucapan lewat section “Doa &amp; Harapan” di undangan. Daftar di bawah adalah ucapan yang sudah masuk.
        </p>
        {isLoading ? (
          <p className="text-xs text-text-secondary">Memuat ucapan…</p>
        ) : isError ? (
          <div role="alert" className="rounded-lg border border-dashed border-red-300 bg-red-50 p-4 text-xs text-red-700">
            <p>{error instanceof Error ? error.message : "Gagal memuat ucapan."}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 rounded-full border border-red-300 px-3 py-1 text-red-700 transition hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        ) : wishes && wishes.length > 0 ? (
          <GuestWishesList wishes={wishes.map((w) => ({ name: w.name, message: w.message || "", created_at: w.created_at }))} />
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-background p-4 text-xs text-text-secondary">
            Belum ada ucapan masuk.
          </p>
        )}
      </div>
    </>
  );
}

const FUN_FACT_ICONS = ["calendar", "camera", "coffee", "gift", "gem", "heart", "home", "map", "music", "plane", "ring", "star", "sparkles"];

function StepFunFacts({ invitation, onChangeFacts }: { invitation: Invitation; onChangeFacts: (facts: Invitation["fun_facts"]) => void }) {
  const facts = invitation.fun_facts || [];

  const updateFact = (index: number, partial: Partial<(typeof facts)[number]>) => {
    onChangeFacts(facts.map((fact, i) => (i === index ? { ...fact, ...partial } : fact)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Muncul di section “Fun Facts” undangan. Kosongkan label/nilai untuk menyembunyikan satu fakta.
      </p>

      {facts.map((fact, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted-foreground">
            Ikon
            <select
              className="mt-0.5 w-full rounded-md border border-border bg-white px-2 py-2 text-base md:py-1.5 md:text-sm"
              value={fact.icon || "sparkles"}
              onChange={(e) => updateFact(index, { icon: e.target.value })}
            >
              {FUN_FACT_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Label
            <input className={`${inputClass} mt-0.5`} placeholder="mis. Kopi Pertama" value={fact.label} onChange={(e) => updateFact(index, { label: e.target.value })} />
          </label>
          <label className="text-xs text-muted-foreground">
            Nilai
            <input className={`${inputClass} mt-0.5`} placeholder="mis. Tahun 2021" value={fact.value} onChange={(e) => updateFact(index, { value: e.target.value })} />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className="min-h-10 rounded-lg px-2 text-xs text-red-500"
              onClick={() => onChangeFacts(facts.filter((_, i) => i !== index))}
            >
              Hapus fakta
            </button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={() => onChangeFacts([...facts, { icon: "sparkles", label: "", value: "" }])}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah fakta
      </Button>
    </div>
  );
}

function StepClosing({ invitation, settings, onChangeSettings, onChange }: { invitation: Invitation; settings: CustomSettings["closing"]; onChangeSettings: (key: SectionKey, next: CustomSettings["closing"]) => void; onChange: FieldChange }) {
  return (
    <>
      <SectionSettingsPanel value={settings} onChange={(next) => onChangeSettings("closing", next)} />
      <div className="mt-3 grid gap-3">
        <Field label="Pesan penutup"><Textarea className={inputClass} rows={4} value={invitation.closing_message || ""} onChange={(e) => onChange("closing_message", e.target.value)} /></Field>
        <Field label="Gambar penutup"><ImageField label="Closing image" folder={uploadFolders.closing} value={invitation.closing_image || null} onChange={(url) => onChange("closing_image", url ?? "")} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
        <Field label="QRIS image"><ImageField label="QRIS" aspect={1} folder={uploadFolders.closing} value={invitation.qris_image || null} onChange={(url) => onChange("qris_image", url ?? "")} positionX={50} positionY={50} zoom={100} rotate={0} onPositionChange={() => {}} /></Field>
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

