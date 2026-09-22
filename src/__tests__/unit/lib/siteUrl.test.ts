describe('getAbsoluteUrl', () => {
    const ORIGINAL_ENV = { ...process.env };

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
        jest.resetModules();
    });

    beforeEach(() => {
        delete process.env.VERCEL_ENV;
        delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
        delete process.env.NEXT_PUBLIC_BASE_URL;
        delete process.env.VERCEL_URL;
    });

    it('prepends the configured base URL to a relative path', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakacreekpac.ca';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/images/article-cover-placeholder.jpg')).toBe(
            'https://kanakacreekpac.ca/images/article-cover-placeholder.jpg'
        );
    });

    it('adds a leading slash if the path is missing one', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakacreekpac.ca';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('articles/abc')).toBe('https://kanakacreekpac.ca/articles/abc');
    });

    it('returns an already-absolute URL unchanged', async () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://kanakacreekpac.ca';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('https://cdn.supabase.co/storage/v1/object/public/images/a.png')).toBe(
            'https://cdn.supabase.co/storage/v1/object/public/images/a.png'
        );
    });

    it('falls back to VERCEL_URL when NEXT_PUBLIC_BASE_URL is unset', async () => {
        process.env.VERCEL_URL = 'kanakapac-abc123.vercel.app';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/articles/abc')).toBe(
            'https://kanakapac-abc123.vercel.app/articles/abc'
        );
    });

    it('falls back to localhost when nothing is set', async () => {
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/articles/abc')).toBe('http://localhost:3000/articles/abc');
    });

    it('uses VERCEL_PROJECT_PRODUCTION_URL on production, even if NEXT_PUBLIC_BASE_URL is stale', async () => {
        process.env.VERCEL_ENV = 'production';
        process.env.VERCEL_PROJECT_PRODUCTION_URL = 'www.kanakacreekpac.ca';
        process.env.NEXT_PUBLIC_BASE_URL = 'https://this-is-stale.example.com';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/articles/abc')).toBe('https://www.kanakacreekpac.ca/articles/abc');
    });

    it('does not use VERCEL_PROJECT_PRODUCTION_URL outside of production (e.g. preview deployments)', async () => {
        process.env.VERCEL_ENV = 'preview';
        process.env.VERCEL_PROJECT_PRODUCTION_URL = 'www.kanakacreekpac.ca';
        process.env.VERCEL_URL = 'kanakapac-git-branch-abc123.vercel.app';
        jest.resetModules();
        const { getAbsoluteUrl } = await import('@/lib/siteUrl');

        expect(getAbsoluteUrl('/articles/abc')).toBe(
            'https://kanakapac-git-branch-abc123.vercel.app/articles/abc'
        );
    });
});
