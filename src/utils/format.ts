/** `$1.2m` / `$340k` — compact currency used across popups and cards. */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

/**
 * Bubble labels round to whole units above 10 to keep the text inside small
 * circles, so they cannot reuse `formatCurrency`.
 */
export function formatVolume(volume: number): string {
  const compact = (value: number, suffix: string) =>
    `$${value >= 10 ? Math.round(value) : value.toFixed(value % 1 === 0 ? 0 : 1)}${suffix}`;

  if (volume >= 1_000_000) return compact(volume / 1_000_000, "m");
  if (volume >= 1_000) return compact(volume / 1_000, "k");
  return `$${Math.round(volume)}`;
}

/** Market price (0–1) rendered as cents. */
export function formatCents(price: number, fractionDigits = 1): string {
  return `${(price * 100).toFixed(fractionDigits)}¢`;
}

export function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}
