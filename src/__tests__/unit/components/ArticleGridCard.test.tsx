import { render, screen } from '@testing-library/react';
import ArticleGridCard from '@/components/ArticleGridCard';
import { Article } from '@/lib/types';

const mockArticle: Article = {
    id: 'art-3',
    title: 'New Bike Racks Installed Thanks to a PAC Grant',
    author: 'Priya Nair',
    excerpt: 'Twenty more bikes can now park safely at the north entrance.',
    body: '<p>Twenty more bikes can now park safely <script>alert(1)</script> and here is a lot more detail about the installation.</p>',
    coverImageUrl: 'https://example.com/bike-rack.png',
    status: 'published',
    publishedAt: '2026-09-14T10:00:00Z',
    createdAt: '2026-09-12T10:00:00Z',
};

describe('ArticleGridCard', () => {
    it('renders the title', () => {
        render(<ArticleGridCard article={mockArticle} />);
        expect(screen.getByText('New Bike Racks Installed Thanks to a PAC Grant')).toBeInTheDocument();
    });

    it('renders the formatted published date', () => {
        render(<ArticleGridCard article={mockArticle} />);
        expect(screen.getByText(/September 14, 2026/)).toBeInTheDocument();
    });

    it('does not render the author', () => {
        render(<ArticleGridCard article={mockArticle} />);
        expect(screen.queryByText(/Priya Nair/)).not.toBeInTheDocument();
    });

    it('does not render the excerpt or raw body HTML', () => {
        render(<ArticleGridCard article={mockArticle} />);
        expect(
            screen.queryByText(/Twenty more bikes can now park safely at the north entrance\./)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/<script>/)).not.toBeInTheDocument();
        expect(screen.queryByText(/a lot more detail about the installation/)).not.toBeInTheDocument();
    });

    it('renders cover image when set', () => {
        render(<ArticleGridCard article={mockArticle} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', mockArticle.coverImageUrl);
    });

    it('renders the placeholder image when no cover image is set', () => {
        const noImage = { ...mockArticle, coverImageUrl: undefined };
        render(<ArticleGridCard article={noImage} />);
        expect(screen.getByRole('img')).toHaveAttribute('src', '/images/article-cover-placeholder.jpg');
    });

    it('links to the article detail page', () => {
        render(<ArticleGridCard article={mockArticle} />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/articles/art-3');
    });
});
