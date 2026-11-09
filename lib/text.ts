// No React here: the ask-bar function on Cloudflare imports this too

// Plain text from Markdown: for post previews and for the ask bar's sources
export function markdownToText(md: string) {
  // Escaped characters are literal text; park them so the marker stripping below skips them
  const escaped: string[] = [];
  return md
    .replace(/\\([\\`*_[\]<|])/g, (_, c: string) => `\u0000${escaped.push(c) - 1}\u0000`)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+|^>\s?|^\s*[-*]\s+(\[[ x]\]\s+)?|^\s*\d+\.\s+|^\s*\|?\s*-{3,}.*$/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/<(https?:[^>]+)>/g, '$1')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => escaped[Number(i)]);
}
