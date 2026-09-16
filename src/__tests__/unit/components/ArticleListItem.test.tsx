import { render, screen } from '@testing-library/react';
import ArticleListItem from '@/components/ArticleListItem';
import { Article } from '@/lib/types';

const mockArticle: Article = {
    id: 'art-2',
    title: 'Spring Fundraiser Recap',
    author: 'John Smith',
    excerpt: 'Thanks to everyone who came out to support the spring fundraiser.',
    body: '<p>Thanks to everyone who came out <script>alert(1)</script> and here is a lot more detail about how much we raised.</p>',
    coverImageUrl: 'https://example.com/cover2.png',
    status: 'published',
    publishedAt: '2026-08-20T10:00:00Z',
    createdAt: '2026-08-18T10:00:00Z',
};

describe('ArticleListItem', () => {
    it('renders title, excerpt, and author', () => {
        render(<ArticleListItem article={mockArticle} />);
        expect(screen.getByText('Spring Fundraiser Recap')).toBeInTheDocument();
        expect(
            screen.getByText('Thanks to everyone who came out to support the spring fundraiser.')
        ).toBeInTheDocument();
        expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    });

    it('renders the excerpt, not the raw body HTML', () => {
        render(<ArticleListItem article={mockArticle} />);
        expect(screen.queryByText(/<script>/)).not.toBeInTheDocument();
        expect(
            screen.queryByText(/how much we raised/)
        ).not.toBeInTheDocument();
    });

    it('renders thumbnail image when set', () => {
        render(<ArticleListItem article={mockArticle} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', mockArticle.coverImageUrl);
    });

    it('does not render an image when no cover image is set', () => {
        const noImage = { ...mockArticle, coverImageUrl: undefined };
        render(<ArticleListItem article={noImage} />);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('links to the article detail page', () => {
        render(<ArticleListItem article={mockArticle} />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/art-2');
    });
});
