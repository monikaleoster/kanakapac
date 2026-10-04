/** True when the URL's path ends in .pdf (case-insensitive, ignoring query/hash). */
export function isPdfUrl(url: string): boolean {
  return /\.pdf$/i.test(url.split(/[?#]/)[0]);
}
