import { getEvents, saveEvent, deleteEvent, getUpcomingEvents, getPastEvents, getEventById, getArticles, getPublishedArticles, getArticleById, saveArticle, deleteArticle } from '@/lib/data';
import { supabase } from '@/lib/supabase';

// Mock supabase correctly
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
    },
}));

describe('data.ts lib unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Events', () => {
        it('getEvents returns mapped array', async () => {
            const mockData = [
                { id: '1', title: 'Event 1', date: '2026-01-01', time: '10:00', location: 'Loc 1', description: 'Desc 1', created_at: '2026-01-01T00:00:00Z' },
                { id: '2', title: 'Event 2', date: '2026-01-02', time: '11:00', location: 'Loc 2', description: 'Desc 2', created_at: '2026-01-02T00:00:00Z' },
            ];
            (supabase.from('events').select('*') as any).order.mockResolvedValue({ data: mockData, error: null });

            const events = await getEvents();
            expect(events).toHaveLength(2);
            expect(events[0].createdAt).toBe('2026-01-01T00:00:00Z');
            expect(events[0].id).toBe('1');
        });

        it('getEvents returns empty array on error', async () => {
            (supabase.from('events').select('*') as any).order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            const events = await getEvents();
            expect(events).toEqual([]);
        });

        it('getUpcomingEvents filters by today', async () => {
            (supabase.from('events').select('*') as any).gte.mockReturnThis();
            (supabase.from('events').select('*') as any).gte('date', '').order.mockResolvedValue({ data: [], error: null });

            await getUpcomingEvents();
            expect(supabase.from).toHaveBeenCalledWith('events');
            expect((supabase as any).gte).toHaveBeenCalledWith('date', expect.stringContaining('20'));
        });

        it('getEventById returns undefined on not found', async () => {
            (supabase.from('events').select('*') as any).eq.mockReturnThis();
            (supabase.from('events').select('*') as any).eq('id', '1').single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

            const event = await getEventById('1');
            expect(event).toBeUndefined();
        });

        it('saveEvent calls upsert with correct payload', async () => {
            const mockEvent = {
                id: '1',
                title: 'New Event',
                date: '2026-03-01',
                time: '12:00',
                location: 'New Loc',
                description: 'New Desc',
                rsvpEnabled: false,
                rsvpCount: 0,
                createdAt: '2026-01-01T00:00:00Z'
            };
            (supabase.from('events') as any).upsert.mockResolvedValue({ error: null });

            await saveEvent(mockEvent);
            expect((supabase as any).upsert).toHaveBeenCalledWith({
                id: '1',
                title: 'New Event',
                date: '2026-03-01',
                time: '12:00',
                location: 'New Loc',
                description: 'New Desc',
                created_at: '2026-01-01T00:00:00Z'
            });
        });

        it('deleteEvent calls delete with id', async () => {
            (supabase.from('events') as any).delete.mockReturnThis();
            ((supabase as any).delete().eq as jest.Mock).mockResolvedValue({ error: null });

            await deleteEvent('123');
            expect((supabase as any).delete).toHaveBeenCalled();
            expect((supabase as any).eq).toHaveBeenCalledWith('id', '123');
        });
    });

    describe('Articles', () => {
        beforeEach(() => {
            // Some earlier tests (e.g. deleteEvent) leave `.eq` mocked to
            // resolve directly rather than chain, since mockResolvedValue
            // persists across jest.clearAllMocks(). Reset it to the default
            // chainable behavior before each Article test.
            (supabase as any).eq.mockReturnThis();
        });

        it('getArticles returns mapped array', async () => {
            const mockData = [
                { id: '1', title: 'Article 1', author: 'Jane', excerpt: 'Excerpt 1', body: '<p>Body 1</p>', cover_image_url: null, status: 'draft', published_at: null, created_at: '2026-01-02T00:00:00Z' },
                { id: '2', title: 'Article 2', author: 'John', excerpt: 'Excerpt 2', body: '<p>Body 2</p>', cover_image_url: 'https://example.com/cover.png', status: 'published', published_at: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
            ];
            (supabase.from('articles').select('*') as any).order.mockResolvedValue({ data: mockData, error: null });

            const articles = await getArticles();
            expect(articles).toHaveLength(2);
            expect(articles[0].id).toBe('1');
            expect(articles[0].coverImageUrl).toBeUndefined();
            expect(articles[0].publishedAt).toBeNull();
            expect(articles[1].coverImageUrl).toBe('https://example.com/cover.png');
            expect(articles[1].publishedAt).toBe('2026-01-01T00:00:00Z');
        });

        it('getArticles returns empty array on error', async () => {
            (supabase.from('articles').select('*') as any).order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            const articles = await getArticles();
            expect(articles).toEqual([]);
        });

        it('getPublishedArticles filters by status=published and orders by publishedAt descending', async () => {
            const mockData = [
                { id: '2', title: 'Newer', author: 'A', excerpt: 'E', body: '<p>B</p>', cover_image_url: null, status: 'published', published_at: '2026-02-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
                { id: '1', title: 'Older', author: 'B', excerpt: 'E', body: '<p>B</p>', cover_image_url: null, status: 'published', published_at: '2026-01-01T00:00:00Z', created_at: '2026-01-01T00:00:00Z' },
            ];
            (supabase.from('articles').select('*').eq('status', 'published') as any).order.mockResolvedValue({ data: mockData, error: null });

            const articles = await getPublishedArticles();

            expect(supabase.from).toHaveBeenCalledWith('articles');
            expect((supabase as any).eq).toHaveBeenCalledWith('status', 'published');
            expect((supabase as any).order).toHaveBeenCalledWith('published_at', { ascending: false });
            expect(articles).toHaveLength(2);
            expect(articles.every(a => a.status === 'published')).toBe(true);
            expect(articles[0].id).toBe('2');
            expect(articles[1].id).toBe('1');
        });

        it('getPublishedArticles returns empty array on error', async () => {
            (supabase.from('articles').select('*').eq('status', 'published') as any).order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            const articles = await getPublishedArticles();
            expect(articles).toEqual([]);
        });

        it('getArticleById returns mapped article', async () => {
            const mockData = { id: '1', title: 'Article 1', author: 'Jane', excerpt: 'Excerpt', body: '<p>Body</p>', cover_image_url: null, status: 'draft', published_at: null, created_at: '2026-01-01T00:00:00Z' };
            (supabase.from('articles').select('*') as any).eq('id', '1').single.mockResolvedValue({ data: mockData, error: null });

            const article = await getArticleById('1');
            expect(article?.id).toBe('1');
            expect(article?.status).toBe('draft');
            expect(article?.publishedAt).toBeNull();
        });

        it('getArticleById returns undefined on not found', async () => {
            (supabase.from('articles').select('*') as any).eq('id', '1').single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

            const article = await getArticleById('1');
            expect(article).toBeUndefined();
        });

        it('saveArticle calls upsert with correctly mapped payload for a new draft', async () => {
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: null });

            const article = {
                id: '3',
                title: 'New Article',
                author: 'Jane Doe',
                excerpt: 'New excerpt',
                body: '<p>New body</p>',
                coverImageUrl: 'https://example.com/cover.png',
                status: 'draft' as const,
                publishedAt: null,
                createdAt: '2026-01-01T00:00:00Z',
            };

            await saveArticle(article);

            expect((supabase as any).upsert).toHaveBeenCalledWith({
                id: '3',
                title: 'New Article',
                author: 'Jane Doe',
                excerpt: 'New excerpt',
                body: '<p>New body</p>',
                cover_image_url: 'https://example.com/cover.png',
                status: 'draft',
                published_at: null,
                created_at: '2026-01-01T00:00:00Z',
            });
        });

        it('saveArticle stamps publishedAt when a draft transitions to published', async () => {
            (supabase.from('articles').select('status, published_at') as any).eq('id', '1').single.mockResolvedValue({
                data: { status: 'draft', published_at: null },
                error: null,
            });
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: null });

            const article = {
                id: '1',
                title: 'Article 1',
                author: 'Jane',
                excerpt: 'Excerpt',
                body: '<p>Body</p>',
                status: 'published' as const,
                publishedAt: null,
                createdAt: '2026-01-01T00:00:00Z',
            };

            await saveArticle(article);

            const upsertCall = ((supabase as any).upsert as jest.Mock).mock.calls[0][0];
            expect(upsertCall.status).toBe('published');
            expect(upsertCall.published_at).toEqual(expect.any(String));
            expect(upsertCall.published_at).not.toBeNull();
        });

        it('saveArticle leaves publishedAt untouched on subsequent save of an already-published article', async () => {
            (supabase.from('articles').select('status, published_at') as any).eq('id', '1').single.mockResolvedValue({
                data: { status: 'published', published_at: '2026-01-01T00:00:00Z' },
                error: null,
            });
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: null });

            const article = {
                id: '1',
                title: 'Article 1 updated',
                author: 'Jane',
                excerpt: 'Excerpt',
                body: '<p>Body updated</p>',
                status: 'published' as const,
                publishedAt: '2026-01-01T00:00:00Z',
                createdAt: '2026-01-01T00:00:00Z',
            };

            await saveArticle(article);

            const upsertCall = ((supabase as any).upsert as jest.Mock).mock.calls[0][0];
            expect(upsertCall.published_at).toBe('2026-01-01T00:00:00Z');
        });

        it('saveArticle leaves publishedAt untouched when the status lookup errors on an already-published article', async () => {
            // A transient DB/network failure on the existing-row lookup must
            // not be mistaken for "no existing row" (which would re-stamp
            // publishedAt as if this were a fresh publish).
            (supabase.from('articles').select('status, published_at') as any).eq('id', '1').single.mockResolvedValue({
                data: null,
                error: { message: 'transient DB error' },
            });
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: null });

            const article = {
                id: '1',
                title: 'Article 1 updated',
                author: 'Jane',
                excerpt: 'Excerpt',
                body: '<p>Body updated</p>',
                status: 'published' as const,
                publishedAt: '2026-01-01T00:00:00Z',
                createdAt: '2026-01-01T00:00:00Z',
            };

            await saveArticle(article);

            const upsertCall = ((supabase as any).upsert as jest.Mock).mock.calls[0][0];
            expect(upsertCall.published_at).toBe('2026-01-01T00:00:00Z');
        });

        it('saveArticle leaves publishedAt null for a draft save', async () => {
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: null });

            const article = {
                id: '2',
                title: 'Draft article',
                author: 'Jane',
                excerpt: 'Excerpt',
                body: '<p>Body</p>',
                status: 'draft' as const,
                publishedAt: null,
                createdAt: '2026-01-01T00:00:00Z',
            };

            await saveArticle(article);

            const upsertCall = ((supabase as any).upsert as jest.Mock).mock.calls[0][0];
            expect(upsertCall.status).toBe('draft');
            expect(upsertCall.published_at).toBeNull();
        });

        it('saveArticle throws when upsert errors', async () => {
            (supabase.from('articles') as any).upsert.mockResolvedValue({ error: { message: 'DB Error' } });

            const article = {
                id: '4',
                title: 'Bad Article',
                author: 'Jane',
                excerpt: 'Excerpt',
                body: '<p>Body</p>',
                status: 'draft' as const,
                publishedAt: null,
                createdAt: '2026-01-01T00:00:00Z',
            };

            await expect(saveArticle(article)).rejects.toBeTruthy();
        });

        it('deleteArticle calls delete with id', async () => {
            (supabase.from('articles') as any).delete.mockReturnThis();
            ((supabase as any).delete().eq as jest.Mock).mockResolvedValue({ error: null });

            await deleteArticle('123');
            expect((supabase as any).delete).toHaveBeenCalled();
            expect((supabase as any).eq).toHaveBeenCalledWith('id', '123');
        });
    });
});
