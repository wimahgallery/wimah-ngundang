"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { invitationCreateSchema, type InvitationCreateInput } from "@/lib/schemas";
import { EVENT_TYPES } from "@/lib/invitation";
import { slugify } from "@/lib/utils";
import { templateMeta } from "@/components/invitation/template-registry";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function InvitationCreateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvitationCreateInput>({
    resolver: zodResolver(invitationCreateSchema),
    defaultValues: {
      slug: "",
      event_title: "",
      event_type: "Wedding",
      template_id: "elegant-classic",
      bride_name: "",
      groom_name: "",
    },
  });

  const templateId = watch("template_id");

  async function onSubmit(values: InvitationCreateInput) {
    setError("");
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Gagal membuat undangan");
      return;
    }
    router.push(`/dashboard/invitations/${json.slug}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Create Invitation</h1>
        <p className="text-sm text-muted-foreground">Pilih template, lalu lengkapi data di editor.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Judul acara</span>
          <input
            className={inputClass}
            {...register("event_title")}
            onBlur={(e) => {
              const current = watch("slug");
              if (!current) setValue("slug", slugify(e.target.value));
            }}
          />
          {errors.event_title && <p className="mt-1 text-xs text-red-600">{errors.event_title.message}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Slug</span>
          <input className={inputClass} {...register("slug")} />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Jenis acara</span>
          <select className={inputClass} {...register("event_type")}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nama mempelai wanita</span>
            <input className={inputClass} {...register("bride_name")} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nama mempelai pria</span>
            <input className={inputClass} {...register("groom_name")} />
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-xl">Template</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateMeta.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setValue("template_id", tpl.id)}
              className={`rounded-2xl border p-4 text-left ${templateId === tpl.id ? "border-primary bg-primary/10" : "border-border bg-white"}`}
            >
              <p className="font-heading text-lg">{tpl.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tpl.description}</p>
              <Link href={`/preview/${tpl.id}`} target="_blank" className="mt-3 inline-block text-xs text-primary">
                Preview dummy data
              </Link>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("template_id")} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Membuat..." : "Buat undangan"}
        </Button>
        <Link href="/dashboard/invitations" className="inline-flex items-center text-sm text-muted-foreground">
          Batal
        </Link>
      </div>
    </form>
  );
}
