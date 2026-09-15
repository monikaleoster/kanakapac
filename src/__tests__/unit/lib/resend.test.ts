import { buildContactEmailHtml, buildContactConfirmationHtml, buildArticleEmailHtml } from '@/lib/resend';

describe('buildContactEmailHtml', () => {
    it('includes all four fields', () => {
        const html = buildContactEmailHtml(
            'Jane Doe',
            'jane@example.com',
            'Question about bylaws',
            'Line one\nLine two'
        );

        expect(html).toContain('Jane Doe');
        expect(html).toContain('jane@example.com');
        expect(html).toContain('Question about bylaws');
        expect(html).toContain('Line one<br>Line two');
    });

    it('escapes HTML in user-supplied fields', () => {
        const html = buildContactEmailHtml(
            '<script>alert(1)</script>',
            'jane@example.com',
            'Subject',
            'Message'
        );

        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;script&gt;');
    });
});

describe('buildContactConfirmationHtml', () => {
    it('greets the submitter by name and acknowledges receipt', () => {
        const html = buildContactConfirmationHtml('Jane Doe');

        expect(html).toContain('Jane Doe');
        expect(html).toMatch(/received your message/i);
    });
});

describe('buildArticleEmailHtml', () => {
    it('includes the title, author, and formatted body', () => {
        const html = buildArticleEmailHtml(
            'PAC Wins Playground Grant',
            'Jane Doe',
            '<p>The PAC secured <strong>funding</strong>.</p>',
            'https://example.com/unsubscribe?token=abc',
            'Kanaka PAC'
        );

        expect(html).toContain('PAC Wins Playground Grant');
        expect(html).toContain('Jane Doe');
        expect(html).toContain('<p>The PAC secured <strong>funding</strong>.</p>');
        expect(html).toContain('https://example.com/unsubscribe?token=abc');
    });

    it('sanitizes the body before interpolating it into the email', () => {
        const html = buildArticleEmailHtml(
            'Title',
            'Author',
            '<p>Safe text</p><script>alert(1)</script><img src=x onerror="alert(1)">',
            'https://example.com/unsubscribe',
            'Kanaka PAC'
        );

        expect(html).toContain('Safe text');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('onerror');
    });
});
