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

    it('escapes HTML in the title and author', () => {
        const html = buildArticleEmailHtml(
            '<script>alert(1)</script>',
            '<img src=x onerror="alert(1)">',
            '<p>Body</p>',
            'https://example.com/unsubscribe',
            'Kanaka PAC'
        );

        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).not.toContain('<img src=x onerror="alert(1)">');
        expect(html).toContain('&lt;script&gt;');
    });
});

describe('sendEmail sender identity', () => {
    const send = jest.fn();

    beforeEach(() => {
        jest.resetModules();
        send.mockReset();
        send.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
        process.env.RESEND_API_KEY = 'test-key';
        delete process.env.RESEND_FROM_EMAIL;
    });

    async function loadSendEmail() {
        jest.doMock('resend', () => ({
            Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
        }));
        return (await import('@/lib/resend')).sendEmail;
    }

    it('defaults to the platform from-address and reply-to when neither is given', async () => {
        const sendEmail = await loadSendEmail();

        await sendEmail({ to: 'parent@example.com', subject: 'Hi', html: '<p>Hi</p>' });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'Kanaka PAC <onboarding@resend.dev>',
                replyTo: 'support@vectorlocal.ca',
                to: ['parent@example.com'],
            })
        );
    });

    it('uses the configured from-address verbatim when no display name is given', async () => {
        process.env.RESEND_FROM_EMAIL = 'Configured Name <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({ to: 'parent@example.com', subject: 'Hi', html: '<p>Hi</p>' });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Configured Name <mail@pacsolution.ca>' })
        );
    });

    it('overrides the display name while keeping the verified sending address', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Westview PAC <mail@pacsolution.ca>' })
        );
    });

    it('composes a display name onto a bare configured address', async () => {
        process.env.RESEND_FROM_EMAIL = 'mail@pacsolution.ca';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Westview PAC <mail@pacsolution.ca>' })
        );
    });

    it('sends replies to the given reply-to instead of the default', async () => {
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            replyTo: 'westview.pac@example.com',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ replyTo: 'westview.pac@example.com' })
        );
    });

    it('accepts a display name and a reply-to together', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: ['a@example.com', 'b@example.com'],
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC',
            replyTo: 'westview.pac@example.com',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'Westview PAC <mail@pacsolution.ca>',
                replyTo: 'westview.pac@example.com',
                to: ['a@example.com', 'b@example.com'],
            })
        );
    });
    it('neutralises a CR/LF header-injection attempt in the display name', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC\r\nBcc: attacker@example.com',
        });

        const from = send.mock.calls[0][0].from as string;
        // The payload must not survive as a second header line, and must stay
        // inside a quoted display name rather than becoming header syntax.
        expect(from).not.toMatch(/[\r\n]/);
        expect(from).toBe('"Westview PAC Bcc: attacker@example.com" <mail@pacsolution.ca>');
    });

    it('quotes a display name containing RFC 5322 special characters', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Smith, John PAC',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: '"Smith, John PAC" <mail@pacsolution.ca>' })
        );
    });

    it('escapes embedded quotes and backslashes in the display name', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'The "Big" PAC',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: '"The \\"Big\\" PAC" <mail@pacsolution.ca>' })
        );
    });

    it('leaves a plain display name unquoted', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Westview PAC <mail@pacsolution.ca>' })
        );
    });

    it('ignores a display name that is empty once stripped', async () => {
        process.env.RESEND_FROM_EMAIL = 'Kanaka PAC <mail@pacsolution.ca>';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: '   ',
        });

        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Kanaka PAC <mail@pacsolution.ca>' })
        );
    });

    it('ignores a display name when the configured from-address is unusable', async () => {
        process.env.RESEND_FROM_EMAIL = 'Not An Address';
        const sendEmail = await loadSendEmail();

        await sendEmail({
            to: 'parent@example.com',
            subject: 'Hi',
            html: '<p>Hi</p>',
            fromName: 'Westview PAC',
        });

        // Better to send as configured than to emit 'Westview PAC <Not An Address>'.
        expect(send).toHaveBeenCalledWith(
            expect.objectContaining({ from: 'Not An Address' })
        );
    });
});
