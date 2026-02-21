export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    const val = volume / 1_000_000;
    return `$${val >= 10 ? Math.round(val) : val.toFixed(val % 1 === 0 ? 0 : 1)}m`;
  }
  if (volume >= 1_000) {
    const val = volume / 1_000;
    return `$${val >= 10 ? Math.round(val) : val.toFixed(val % 1 === 0 ? 0 : 1)}k`;
  }
  return `$${Math.round(volume)}`;
}
