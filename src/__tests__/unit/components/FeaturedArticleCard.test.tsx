import { render, screen } from '@testing-library/react';
import FeaturedArticleCard from '@/components/FeaturedArticleCard';
import { Article } from '@/lib/types';

const mockArticle: Article = {
    id: 'art-1',
    title: 'PAC Wins Playground Grant',
    author: 'Jane Doe',
    excerpt: 'The PAC secured funding for a new playground.',
    body: '<p>The PAC secured funding for a new playground <script>alert(1)</script> and here is a lot more detail about the process.</p>',
    coverImageUrl: 'https://example.com/cover.png',
    status: 'published',
    publishedAt: '2026-08-25T10:00:00Z',
    createdAt: '2026-08-20T10:00:00Z',
};

describe('FeaturedArticleCard', () => {
    it('renders title, excerpt, and author', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        expect(screen.getByText('PAC Wins Playground Grant')).toBeInTheDocument();
        expect(
            screen.getByText('The PAC secured funding for a new playground.')
        ).toBeInTheDocument();
        expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });

    it('renders the excerpt, not the raw body HTML', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        expect(screen.queryByText(/<script>/)).not.toBeInTheDocument();
        expect(
            screen.queryByText(/a lot more detail about the process/)
        ).not.toBeInTheDocument();
    });

    it('renders a "Featured" label', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('renders cover image when set', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', mockArticle.coverImageUrl);
    });

    it('renders the placeholder image when no cover image is set', () => {
        const noImage = { ...mockArticle, coverImageUrl: undefined };
        render(<FeaturedArticleCard article={noImage} />);
        expect(screen.getByRole('img')).toHaveAttribute('src', '/images/article-cover-placeholder.jpg');
    });

    it('links to the article detail page', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/art-1');
    });

    it('renders "Read more" affordance', () => {
        render(<FeaturedArticleCard article={mockArticle} />);
        expect(screen.getByText('Read more')).toBeInTheDocument();
    });
});
