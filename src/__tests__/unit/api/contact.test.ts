/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';
import { sendEmail } from '@/lib/resend';

jest.mock('@/lib/resend', () => ({
    sendEmail: jest.fn(),
    buildContactEmailHtml: jest.fn(() => '<html>treasurer</html>'),
    buildContactConfirmationHtml: jest.fn(() => '<html>confirmation</html>'),
}));

function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

const validBody = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Question about bylaws',
    message: 'Hello there',
};

describe('POST /api/contact', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.CONTACT_EMAIL;
    });

    it('sends a treasurer email and a confirmation email, returns success', async () => {
        (sendEmail as jest.Mock).mockResolvedValue({});

        const res = await POST(makeRequest(validBody));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ success: true });
        expect(sendEmail).toHaveBeenCalledTimes(2);
        expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'kcpactreasurer@gmail.com',
                replyTo: 'jane@example.com',
                subject: '[Contact Form] Question about bylaws',
            })
        );
        expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'jane@example.com',
                subject: 'We received your message — Kanaka PAC',
            })
        );
    });

    it('uses CONTACT_EMAIL env var when set', async () => {
        process.env.CONTACT_EMAIL = 'custom@example.com';
        (sendEmail as jest.Mock).mockResolvedValue({});

        await POST(makeRequest(validBody));

        expect(sendEmail).toHaveBeenCalledWith(
            expect.objectContaining({ to: 'custom@example.com' })
        );
    });

    it.each(['name', 'email', 'subject', 'message'])(
        'returns 400 when %s is missing',
        async (field) => {
            const body = { ...validBody, [field]: undefined };
            const res = await POST(makeRequest(body));
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toBeDefined();
            expect(sendEmail).not.toHaveBeenCalled();
        }
    );

    it('returns 400 when a field is an empty string', async () => {
        const res = await POST(makeRequest({ ...validBody, name: '' }));
        expect(res.status).toBe(400);
    });

    it('returns 400 on malformed JSON instead of throwing', async () => {
        const req = new NextRequest('http://localhost/api/contact', {
            method: 'POST',
            body: 'not json',
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBeDefined();
        expect(sendEmail).not.toHaveBeenCalled();
    });

    it('returns 500 without leaking details when sendEmail throws', async () => {
        (sendEmail as jest.Mock).mockRejectedValue(new Error('Resend API key invalid'));

        const res = await POST(makeRequest(validBody));
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('Failed to send message');
        expect(JSON.stringify(data)).not.toContain('Resend API key invalid');
    });
});
