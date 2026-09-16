import { render, screen } from '@testing-library/react';
import { Article } from '@/lib/types';

jest.mock('@/lib/data', () => ({
    getPublishedArticles: jest.fn(),
}));

jest.mock('@/components/SubscribeForm', () => {
    return function MockSubscribeForm() {
        return <div data-testid="subscribe-form" />;
    };
});

import { getPublishedArticles } from '@/lib/data';
import ArticlesPage from '@/app/articles/page';

const mockGetPublishedArticles = getPublishedArticles as jest.Mock;

function makeArticle(overrides: Partial<Article>): Article {
    return {
        id: 'art-1',
        title: 'Untitled',
        author: 'Author',
        excerpt: 'Excerpt',
        body: '<p>Body</p>',
        coverImageUrl: undefined,
        status: 'published',
        publishedAt: '2026-01-01T10:00:00Z',
        createdAt: '2026-01-01T10:00:00Z',
        ...overrides,
    };
}

describe('ArticlesPage', () => {
    it('renders the most recent article as featured and the rest as a list, in order', async () => {
        mockGetPublishedArticles.mockResolvedValue([
            makeArticle({ id: 'art-3', title: 'Newest Article', publishedAt: '2026-03-01T10:00:00Z' }),
            makeArticle({ id: 'art-2', title: 'Middle Article', publishedAt: '2026-02-01T10:00:00Z' }),
            makeArticle({ id: 'art-1', title: 'Oldest Article', publishedAt: '2026-01-01T10:00:00Z' }),
        ]);

        render(await ArticlesPage());

        const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
        expect(headings[0]).toBe('Newest Article');

        const featuredLink = screen.getByText('Newest Article').closest('a');
        expect(featuredLink).toHaveAttribute('href', '/articles/art-3');

        const listHeadings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
        expect(listHeadings).toEqual(['Middle Article', 'Oldest Article']);
    });

    it('shows the empty state when there are no published articles', async () => {
        mockGetPublishedArticles.mockResolvedValue([]);

        render(await ArticlesPage());

        expect(screen.getByText('No articles published yet.')).toBeInTheDocument();
    });

    it('renders a single article as featured with no list', async () => {
        mockGetPublishedArticles.mockResolvedValue([
            makeArticle({ id: 'art-1', title: 'Only Article' }),
        ]);

        render(await ArticlesPage());

        expect(screen.getByText('Only Article')).toBeInTheDocument();
        expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    });
});
