import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
    it('preserves safe formatting tags and content', () => {
        const safeHtml =
            '<p>Hello <strong>world</strong>, this is <em>great</em>.</p>' +
            '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>' +
            '<ul><li>One</li><li>Two</li></ul>' +
            '<ol><li>First</li><li>Second</li></ol>' +
            '<a href="https://example.com">link</a>' +
            '<img src="https://example.com/pic.png" alt="A picture" />';

        const result = sanitizeHtml(safeHtml);

        expect(result).toContain('<p>Hello <strong>world</strong>, this is <em>great</em>.</p>');
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<h2>Subtitle</h2>');
        expect(result).toContain('<h3>Section</h3>');
        expect(result).toContain('<ul><li>One</li><li>Two</li></ul>');
        expect(result).toContain('<ol><li>First</li><li>Second</li></ol>');
        expect(result).toContain('href="https://example.com"');
        expect(result).toContain('src="https://example.com/pic.png"');
        expect(result).toContain('alt="A picture"');
    });

    it('strips script tags and their content', () => {
        const unsafeHtml = '<p>Before</p><script>alert("xss")</script><p>After</p>';

        const result = sanitizeHtml(unsafeHtml);

        expect(result).not.toContain('<script');
        expect(result).not.toContain('alert(');
        expect(result).toContain('Before');
        expect(result).toContain('After');
    });

    it('strips inline event handler attributes', () => {
        const unsafeHtml = '<img src="https://example.com/pic.png" onerror="alert(1)" />';

        const result = sanitizeHtml(unsafeHtml);

        expect(result).not.toContain('onerror');
        expect(result).not.toContain('alert(1)');
        expect(result).toContain('src="https://example.com/pic.png"');
    });

    it('strips onclick and other on* attributes from formatting tags', () => {
        const unsafeHtml = '<p onclick="doEvil()">Click me</p>';

        const result = sanitizeHtml(unsafeHtml);

        expect(result).not.toContain('onclick');
        expect(result).not.toContain('doEvil');
        expect(result).toContain('Click me');
    });

    it('strips javascript: URLs from href and src', () => {
        const unsafeHtml = '<a href="javascript:alert(1)">bad link</a>';

        const result = sanitizeHtml(unsafeHtml);

        expect(result).not.toContain('javascript:');
    });

    it('strips disallowed tags like iframe while keeping safe text', () => {
        const unsafeHtml = '<p>Safe</p><iframe src="https://evil.example.com"></iframe>';

        const result = sanitizeHtml(unsafeHtml);

        expect(result).not.toContain('<iframe');
        expect(result).toContain('Safe');
    });

    it('returns empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
    });
});
