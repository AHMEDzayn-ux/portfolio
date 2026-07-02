import { z } from "zod";

/**
 * A forgiving URL field: accepts an empty string, or a URL with or without the
 * protocol (e.g. "github.com/you" is normalized to "https://github.com/you").
 * The normalized value is what reaches the Server Action / database. Kept on a
 * string base (not z.preprocess) so the form's input type stays `string`.
 */
export const urlField = z
  .string()
  .trim()
  .transform((v) => (!v ? "" : /^https?:\/\//i.test(v) ? v : `https://${v}`))
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v), {
    message: "Enter a valid URL.",
  });

/**
 * Convert "" to null for the given (nullable) keys only, leaving NOT NULL
 * columns as empty strings so the database never receives a null it rejects.
 */
export function nullifyKeys<T extends Record<string, unknown>>(
  data: T,
  keys: readonly (keyof T)[]
): T {
  const result = { ...data };
  for (const key of keys) {
    if (result[key] === "") {
      result[key] = null as T[keyof T];
    }
  }
  return result;
}
