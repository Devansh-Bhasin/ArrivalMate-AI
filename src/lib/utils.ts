import clsx from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function isoNow() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeText(value: string | undefined) {
  return (value ?? "").replace(/[<>]/g, "").trim();
}

export function toSentenceList(values: string[]) {
  return values.filter(Boolean).join(", ");
}
