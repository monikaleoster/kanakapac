import { render, screen } from '@testing-library/react';
import FacebookShareButton from '@/components/FacebookShareButton';

describe('FacebookShareButton', () => {
    it('links to sharer.php with the URL-encoded article URL', () => {
        render(<FacebookShareButton url="https://kanakapac.com/articles/abc-123" />);

        const link = screen.getByRole('link', { name: /share to facebook/i });
        expect(link).toHaveAttribute(
            'href',
            'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkanakapac.com%2Farticles%2Fabc-123'
        );
    });

    it('opens in a new tab without leaking a window.opener reference', () => {
        render(<FacebookShareButton url="https://kanakapac.com/articles/abc-123" />);

        const link = screen.getByRole('link', { name: /share to facebook/i });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
});
