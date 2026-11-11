const PALETTE = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

/** Picks a stable colour from a category name, so the same category always looks the same. */
export function colorFor(text: string): string {
  let hash = 0;
  for (const ch of text) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
