export type BodySegment =
  | { type: "html"; html: string }
  | { type: "pdf"; url: string; title: string };

// Also swallows a <p> wrapping only the anchor, so the split leaves no empty paragraphs.
const PDF_ANCHOR = /(?:<p>\s*)?<a\s[^>]*\bdata-pdf-viewer\b[^>]*>([\s\S]*?)<\/a>(?:\s*<\/p>)?/gi;

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Splits already-sanitized Article Body HTML into plain HTML runs and
 * embedded PDFs (anchors marked with data-pdf-viewer). The input MUST come
 * from sanitizeHtml, which guarantees a predictable anchor shape and
 * http(s)/mailto-only hrefs.
 */
export function splitArticleBody(sanitizedHtml: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;

  for (const match of Array.from(sanitizedHtml.matchAll(PDF_ANCHOR))) {
    const href = match[0].match(/\shref="([^"]*)"/i)?.[1];
    if (!href) continue;

    const index = match.index ?? 0;
    if (index > last) {
      segments.push({ type: "html", html: sanitizedHtml.slice(last, index) });
    }
    const title = decodeEntities(match[1].replace(/<[^>]*>/g, "")).trim();
    segments.push({ type: "pdf", url: decodeEntities(href), title });
    last = index + match[0].length;
  }

  if (last < sanitizedHtml.length) {
    segments.push({ type: "html", html: sanitizedHtml.slice(last) });
  }
  return segments;
}
