/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import { isAuthenticated } from '@/lib/auth';
import { uploadBuffer } from '@/lib/storage';

jest.mock('@/lib/auth', () => ({
    isAuthenticated: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
    uploadBuffer: jest.fn(),
}));

function makeFile(name: string, type: string, content = 'x') {
    return new File([content], name, { type });
}

function makeRequest(formData: FormData, context?: string) {
    const url = context
        ? `http://localhost/api/upload?context=${context}`
        : 'http://localhost/api/upload';
    return new NextRequest(url, { method: 'POST', body: formData });
}

describe('POST /api/upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isAuthenticated as jest.Mock).mockResolvedValue(true);
    });

    it('returns 401 when unauthenticated', async () => {
        (isAuthenticated as jest.Mock).mockResolvedValue(false);
        const formData = new FormData();
        formData.append('file', makeFile('a.png', 'image/png'));

        const res = await POST(makeRequest(formData, 'image'));

        expect(res.status).toBe(401);
        expect(uploadBuffer).not.toHaveBeenCalled();
    });

    it('returns 400 when no file is provided', async () => {
        const res = await POST(makeRequest(new FormData(), 'image'));
        expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid file type in the image context', async () => {
        const formData = new FormData();
        formData.append('file', makeFile('a.gif', 'image/gif'));

        const res = await POST(makeRequest(formData, 'image'));

        expect(res.status).toBe(400);
        expect(uploadBuffer).not.toHaveBeenCalled();
    });

    it('accepts WebP in the image context', async () => {
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/images/a.webp');
        const formData = new FormData();
        formData.append('file', makeFile('a.webp', 'image/webp'));

        const res = await POST(makeRequest(formData, 'image'));

        expect(res.status).toBe(200);
    });

    it('returns 413 for an image larger than 5MB', async () => {
        const formData = new FormData();
        formData.append('file', makeFile('big.png', 'image/png', 'x'.repeat(5 * 1024 * 1024 + 1)));

        const res = await POST(makeRequest(formData, 'image'));

        expect(res.status).toBe(413);
        expect(uploadBuffer).not.toHaveBeenCalled();
    });

    it('uploads to the images bucket for the image context and returns fileUrl', async () => {
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/images/a.png');
        const formData = new FormData();
        formData.append('file', makeFile('a.png', 'image/png'));

        const res = await POST(makeRequest(formData, 'image'));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ fileUrl: 'https://cdn.example.com/images/a.png' });
        expect(uploadBuffer).toHaveBeenCalledWith(
            'images',
            expect.stringMatching(/a\.png$/),
            expect.anything(),
            'image/png'
        );
    });

    it('uploads to the minutes bucket for the document context (default)', async () => {
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/minutes/a.pdf');
        const formData = new FormData();
        formData.append('file', makeFile('a.pdf', 'application/pdf'));

        const res = await POST(makeRequest(formData));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ fileUrl: 'https://cdn.example.com/minutes/a.pdf' });
        expect(uploadBuffer).toHaveBeenCalledWith(
            'minutes',
            expect.stringMatching(/a\.pdf$/),
            expect.anything(),
            'application/pdf'
        );
    });

    it('accepts a PDF in the pdf context and stores it in the minutes bucket', async () => {
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/minutes/a.pdf');
        const formData = new FormData();
        formData.append('file', makeFile('a.pdf', 'application/pdf'));

        const res = await POST(makeRequest(formData, 'pdf'));

        expect(res.status).toBe(200);
        expect(uploadBuffer).toHaveBeenCalledWith(
            'minutes',
            expect.stringMatching(/a\.pdf$/),
            expect.anything(),
            'application/pdf'
        );
    });

    it('returns 400 for a non-PDF in the pdf context', async () => {
        const formData = new FormData();
        formData.append('file', makeFile('a.txt', 'text/plain'));

        const res = await POST(makeRequest(formData, 'pdf'));

        expect(res.status).toBe(400);
        expect(uploadBuffer).not.toHaveBeenCalled();
    });

    it('returns 413 with a clear message for a PDF over 4MB', async () => {
        const formData = new FormData();
        formData.append('file', makeFile('big.pdf', 'application/pdf', 'x'.repeat(4 * 1024 * 1024 + 1)));

        const res = await POST(makeRequest(formData, 'pdf'));
        const data = await res.json();

        expect(res.status).toBe(413);
        expect(data.error).toMatch(/4MB/);
        expect(uploadBuffer).not.toHaveBeenCalled();
    });

    it('returns 413 for a PDF over 4MB in the default document context', async () => {
        const formData = new FormData();
        formData.append('file', makeFile('big.pdf', 'application/pdf', 'x'.repeat(4 * 1024 * 1024 + 1)));

        const res = await POST(makeRequest(formData));

        expect(res.status).toBe(413);
    });

    it('still accepts non-PDF documents in the document context', async () => {
        (uploadBuffer as jest.Mock).mockResolvedValue('https://cdn.example.com/minutes/a.txt');
        const formData = new FormData();
        formData.append('file', makeFile('a.txt', 'text/plain'));

        const res = await POST(makeRequest(formData));

        expect(res.status).toBe(200);
    });

    it('returns 500 without leaking details when the upload helper throws', async () => {
        (uploadBuffer as jest.Mock).mockRejectedValue(new Error('bucket full'));
        const formData = new FormData();
        formData.append('file', makeFile('a.png', 'image/png'));

        const res = await POST(makeRequest(formData, 'image'));
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(JSON.stringify(data)).not.toContain('bucket full');
    });
});
