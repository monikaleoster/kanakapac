/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/minutes/route';
import { isAuthenticated } from '@/lib/auth';
import { getMinutes, saveMinutes, deleteMinutes } from '@/lib/data';

jest.mock('@/lib/auth', () => ({
    isAuthenticated: jest.fn(),
}));

jest.mock('@/lib/data', () => ({
    getMinutes: jest.fn(),
    saveMinutes: jest.fn(),
    deleteMinutes: jest.fn(),
}));

function makeRequest(method: string, body?: unknown, url = 'http://localhost/api/minutes') {
    return new NextRequest(url, {
        method,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

describe('/api/minutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isAuthenticated as jest.Mock).mockResolvedValue(true);
    });

    describe('GET', () => {
        it('returns the array from getMinutes() with 200', async () => {
            const mockMinutes = [
                { id: '1', title: 'March Meeting', date: '2026-03-01', fileUrl: 'https://example.com/march.pdf', createdAt: '2026-03-01T00:00:00Z' },
            ];
            (getMinutes as jest.Mock).mockResolvedValue(mockMinutes);

            const res = await GET();
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data).toEqual(mockMinutes);
        });
    });

    describe('POST', () => {
        it('returns 401 when unauthenticated', async () => {
            (isAuthenticated as jest.Mock).mockResolvedValue(false);

            const res = await POST(makeRequest('POST', { title: 'March Meeting', date: '2026-03-01', fileUrl: 'https://example.com/march.pdf' }));

            expect(res.status).toBe(401);
            expect(saveMinutes).not.toHaveBeenCalled();
        });

        it('passes fileUrl through to saveMinutes and returns 201 with the created record', async () => {
            (saveMinutes as jest.Mock).mockResolvedValue(undefined);

            const res = await POST(makeRequest('POST', { title: 'March Meeting', date: '2026-03-01', fileUrl: 'https://example.com/march.pdf' }));
            const data = await res.json();

            expect(res.status).toBe(201);
            expect(saveMinutes).toHaveBeenCalledWith(
                expect.objectContaining({ fileUrl: 'https://example.com/march.pdf' })
            );
            expect(data.fileUrl).toBe('https://example.com/march.pdf');
        });
    });

    describe('PUT', () => {
        it('returns 401 when unauthenticated', async () => {
            (isAuthenticated as jest.Mock).mockResolvedValue(false);

            const res = await PUT(makeRequest('PUT', { id: '1', title: 'March Meeting', date: '2026-03-01', fileUrl: 'https://example.com/march.pdf' }));

            expect(res.status).toBe(401);
            expect(saveMinutes).not.toHaveBeenCalled();
        });

        it('passes fileUrl through to saveMinutes and returns 200 with the updated record', async () => {
            (saveMinutes as jest.Mock).mockResolvedValue(undefined);

            const body = { id: '1', title: 'March Meeting', date: '2026-03-01', fileUrl: 'https://example.com/updated.pdf', createdAt: '2026-03-01T00:00:00Z' };
            const res = await PUT(makeRequest('PUT', body));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(saveMinutes).toHaveBeenCalledWith(expect.objectContaining({ fileUrl: 'https://example.com/updated.pdf' }));
            expect(data).toEqual(body);
        });
    });

    describe('DELETE', () => {
        it('returns 401 when unauthenticated', async () => {
            (isAuthenticated as jest.Mock).mockResolvedValue(false);

            const res = await DELETE(makeRequest('DELETE', undefined, 'http://localhost/api/minutes?id=1'));

            expect(res.status).toBe(401);
            expect(deleteMinutes).not.toHaveBeenCalled();
        });

        it('returns 400 without an id query param', async () => {
            const res = await DELETE(makeRequest('DELETE', undefined, 'http://localhost/api/minutes'));

            expect(res.status).toBe(400);
            expect(deleteMinutes).not.toHaveBeenCalled();
        });

        it('deletes and returns success', async () => {
            (deleteMinutes as jest.Mock).mockResolvedValue(undefined);

            const res = await DELETE(makeRequest('DELETE', undefined, 'http://localhost/api/minutes?id=1'));
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(deleteMinutes).toHaveBeenCalledWith('1');
            expect(data).toEqual({ success: true });
        });
    });
});
