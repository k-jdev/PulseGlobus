type ClassValue = string | false | null | undefined;

/** Joins conditional Tailwind class fragments, dropping falsy ones. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
