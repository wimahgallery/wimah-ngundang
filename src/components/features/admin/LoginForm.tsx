"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@/lib/schemas";
import { fieldErrorMessages } from "@/lib/form-errors";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-colors duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: { email: "", password: "" },
    // Validasi memakai schema Zod yang sama dengan endpoint login —
    // sumber `onSubmit` supaya pesan muncul saat dikirim, bukan saat diketik.
    onSubmit: async ({ value }) => {
      setError("");
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (!res.ok) {
          const json = await res.json();
          setError(json.error || "Login failed");
          return;
        }

        router.push("/dashboard/invitations");
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      }
    },
  });

  return (
    <main id="main" className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl text-foreground">Wimah Ngundang</h1>
          <p className="mt-2 text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form.Field name="email" validators={{ onSubmit: loginSchema.shape.email }}>
            {(field) => (
              <div>
                <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="username"
                  className={inputClass}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0 || undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrorMessages(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="password" validators={{ onSubmit: loginSchema.shape.password }}>
            {(field) => (
              <div>
                <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-foreground">
                  Password
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0 || undefined}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrorMessages(field.state.meta.errors)}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-accent-dark disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </main>
  );
}
