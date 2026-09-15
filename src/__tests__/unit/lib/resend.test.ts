import { buildContactEmailHtml, buildContactConfirmationHtml } from '@/lib/resend';

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
