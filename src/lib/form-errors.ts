/**
 * Pesan galat untuk satu field pada TanStack Form.
 *
 * Validator berbasis Standard Schema (Zod) menaruh issue mentah — objek
 * `ZodIssue` dengan properti `message` — di `field.state.meta.errors`,
 * bukan string. Memanggil `errors.join(", ")` langsung menghasilkan
 * "[object Object]", jadi tiap entri dinormalisasi dulu lewat sini.
 */
export function fieldErrorMessages(errors: readonly unknown[]): string {
  return errors
    .map((error) =>
      typeof error === "string"
        ? error
        : (error as { message?: unknown } | null)?.message,
    )
    .filter((message): message is string => typeof message === "string" && message.length > 0)
    .join(", ");
}
