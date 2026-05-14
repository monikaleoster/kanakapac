import { render, screen } from '@testing-library/react';
import MinutesCard from '@/components/MinutesCard';
import { Minutes } from '@/lib/types';

const mockMinutes: Minutes = {
    id: 'min-1',
    title: 'February 2026 Meeting',
    date: '2026-02-05',
    content: 'Budget review and event planning.',
    fileUrl: 'https://example.com/minutes.pdf',
    createdAt: '2026-02-05T19:00:00Z',
};

describe('MinutesCard', () => {
    it('renders title and formatted date', () => {
        render(<MinutesCard minutes={mockMinutes} />);
        expect(screen.getByText('February 2026 Meeting')).toBeInTheDocument();
        expect(screen.getByText('February 5, 2026')).toBeInTheDocument();
    });

    it('shows download link when fileUrl is present', () => {
        render(<MinutesCard minutes={mockMinutes} />);
        const link = screen.getByRole('link', { name: /download/i });
        expect(link).toHaveAttribute('href', 'https://example.com/minutes.pdf');
    });

    it('hides download link when no fileUrl', () => {
        const noFileMinutes = { ...mockMinutes, fileUrl: '' };
        render(<MinutesCard minutes={noFileMinutes} />);
        expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
    });

    it('links to detail page', () => {
        render(<MinutesCard minutes={mockMinutes} />);
        // There are usually two links, one is the title/card, one is the button
        const links = screen.getAllByRole('link');
        const hasDetailLink = links.some(link => link.getAttribute('href') === '/minutes/min-1');
        expect(hasDetailLink).toBe(true);
    });
});
