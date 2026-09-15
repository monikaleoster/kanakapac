import DOMPurify from "isomorphic-dompurify";

/**
 * Tags allowed in an Article Body. Keeps standard rich-text formatting
 * while excluding anything that can execute script or embed arbitrary
 * external content (script, iframe, style, object, embed, form, etc).
 */
const ALLOWED_TAGS = [
    "p",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "br",
    "blockquote",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel"];

/**
 * Sanitizes an HTML string (e.g. an Article Body) for safe storage/rendering.
 * Strips script tags, inline event handler attributes (onerror, onclick, ...),
 * javascript: URLs, and any tag/attribute outside the allowed formatting set,
 * while preserving safe structural/formatting markup.
 *
 * Every path that renders Article Body HTML (public detail page,
 * publish-notification email, etc.) must call this before injecting the
 * content, per ADR 0001.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
    });
}
