/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadBuffer } from '@/lib/storage';

const mockGenerate = jest.fn();

jest.mock('@/lib/auth', () => ({
    isAuthenticated: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
    uploadBuffer: jest.fn(),
}));

jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        images: { generate: mockGenerate },
    }));
});

jest.mock('sharp', () => {
    return jest.fn(() => ({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('jpeg-bytes')),
    }));
});

import { POST } from '@/app/api/articles/generate-cover-image/route';

function makeRequest(body: unknown) {
    return new NextRequest('http://localhost/api/articles/generate-cover-image', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

describe('POST /api/articles/generate-cover-image', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isAuthenticated as jest.Mock).mockResolvedValue(true);
    });

    it('returns 401 when unauthenticated', async () => {
        (isAuthenticated as jest.Mock).mockResolvedValue(false);

        const res = await POST(makeRequest({ prompt: 'a playground' }));

        expect(res.status).toBe(401);
        expect(mockGenerate).not.toHaveBeenCalled();
    });

    it('returns 400 when prompt is missing', async () => {
        const res = await POST(makeRequest({}));
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBeDefined();
    });

    it('returns 400 when prompt is an empty/whitespace string', async () => {
        const res = await POST(makeRequest({ prompt: '   ' }));
        expect(res.status).toBe(400);
    });

    it('generates an image, crops it, uploads it, and returns fileUrl', async () => {
        mockGenerate.mockResolvedValue({
            data: [{ b64_json: Buffer.from('fake-png-bytes').toString('base64') }],
        });
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/images/cover.jpg');

        const res = await POST(makeRequest({ prompt: 'a playground with kids' }));
        const data = await res.json();

        expect(mockGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ prompt: 'a playground with kids' })
        );
        expect(uploadBuffer).toHaveBeenCalledWith(
            'images',
            expect.any(String),
            expect.any(Buffer),
            'image/jpeg'
        );
        expect(res.status).toBe(200);
        expect(data).toEqual({ fileUrl: 'https://cdn.example.com/images/cover.jpg' });
    });

    it('returns 500 with a generic message when the provider call throws', async () => {
        mockGenerate.mockRejectedValue(new Error('OpenAI API key invalid'));

        const res = await POST(makeRequest({ prompt: 'a playground' }));
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBeDefined();
        expect(JSON.stringify(data)).not.toContain('OpenAI API key invalid');
    });

    it('returns 500 with a generic message when the storage upload throws', async () => {
        mockGenerate.mockResolvedValue({
            data: [{ b64_json: Buffer.from('fake-png-bytes').toString('base64') }],
        });
        (uploadBuffer as jest.Mock).mockRejectedValue(new Error('bucket full'));

        const res = await POST(makeRequest({ prompt: 'a playground' }));
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(JSON.stringify(data)).not.toContain('bucket full');
    });

    it('returns 400 on malformed JSON instead of throwing', async () => {
        const req = new NextRequest('http://localhost/api/articles/generate-cover-image', {
            method: 'POST',
            body: 'not json',
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});
