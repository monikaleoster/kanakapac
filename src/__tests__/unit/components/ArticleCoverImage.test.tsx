import { render, screen } from '@testing-library/react';
import ArticleCoverImage from '@/components/ArticleCoverImage';

describe('ArticleCoverImage', () => {
    it('renders the given cover image with the given alt text and class name', () => {
        render(
            <ArticleCoverImage
                article={{ coverImageUrl: 'https://example.com/cover.png' }}
                alt="A cover"
                className="test-class"
            />
        );

        const img = screen.getByRole('img', { name: 'A cover' });
        expect(img).toHaveAttribute('src', 'https://example.com/cover.png');
        expect(img).toHaveClass('test-class');
    });

    it('falls back to the placeholder image when no cover image is set', () => {
        render(
            <ArticleCoverImage article={{ coverImageUrl: undefined }} alt="A cover" className="test-class" />
        );

        expect(screen.getByRole('img')).toHaveAttribute('src', '/images/article-cover-placeholder.jpg');
    });
});
