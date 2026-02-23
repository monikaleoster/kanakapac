import { render, screen } from '@testing-library/react';
import AnnouncementCard from '@/components/AnnouncementCard';
import { Announcement } from '@/lib/types';

const mockAnnouncement: Announcement = {
    id: 'ann-1',
    title: 'Welcome Back',
    content: 'School starts Sept 5.',
    priority: 'normal',
    publishedAt: '2026-08-25T10:00:00Z',
    expiresAt: null,
};

describe('AnnouncementCard', () => {
    it('renders title and content', () => {
        render(<AnnouncementCard announcement={mockAnnouncement} />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('School starts Sept 5.')).toBeInTheDocument();
    });

    it('urgent priority shows visual indicator', () => {
        const urgentAnnouncement: Announcement = { ...mockAnnouncement, priority: 'urgent' };
        render(<AnnouncementCard announcement={urgentAnnouncement} />);
        // Adjust based on actual implementation (e.g., looking for "Urgent" text or a specific class)
        expect(screen.getByText(/urgent/i)).toBeInTheDocument();
    });

    it('normal priority has no urgency indicator', () => {
        render(<AnnouncementCard announcement={mockAnnouncement} />);
        expect(screen.queryByText(/urgent/i)).not.toBeInTheDocument();
    });
});
