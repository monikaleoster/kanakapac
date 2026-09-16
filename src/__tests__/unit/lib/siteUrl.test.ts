describe('getAbsoluteUrl', () => {
    const ORIGINAL_ENV = process.env.NEXT_PUBLIC_BASE_URL;

    afterEach(() => {
        process.env.NEXT_PUBLIC_BASE_URL = ORIGINAL_ENV;
        jest.resetModules();
    });

    it('prepends the configured base URL to a relative path', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakapac.com';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/images/article-cover-placeholder.jpg')).toBe(
            'https://kanakapac.com/images/article-cover-placeholder.jpg'
        );
    });

    it('adds a leading slash if the path is missing one', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakapac.com';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('articles/abc')).toBe('https://kanakapac.com/articles/abc');
    });

    it('returns an already-absolute URL unchanged', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakapac.com';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('https://cdn.supabase.co/storage/v1/object/public/images/a.png')).toBe(
            'https://cdn.supabase.co/storage/v1/object/public/images/a.png'
        );
    });

    it('falls back to localhost when NEXT_PUBLIC_BASE_URL is unset', async () => {
        delete process.env.NEXT_PUBLIC_BASE_URL;
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/articles/abc')).toBe('http://localhost:3000/articles/abc');
    });
});
