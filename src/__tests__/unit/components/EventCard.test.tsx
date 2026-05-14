import { render, screen } from '@testing-library/react';
import EventCard from '@/components/EventCard';
import { Event } from '@/lib/types';

const mockEvent: Event = {
    id: 'evt-1',
    title: 'Spring Fair',
    date: '2026-06-15',
    time: '09:00',
    location: 'School Gym',
    description: 'Annual fair with games and food.',
    createdAt: '2026-01-01T00:00:00Z',
};

describe('EventCard', () => {
    it('renders event title', () => {
        render(<EventCard event={mockEvent} />);
        expect(screen.getByText('Spring Fair')).toBeInTheDocument();
    });

    it('renders formatted date', () => {
        render(<EventCard event={mockEvent} />);
        expect(screen.getByText(/June 15, 2026/)).toBeInTheDocument();
    });

    it('renders formatted time', () => {
        render(<EventCard event={mockEvent} />);
        expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
    });

    it('renders location', () => {
        render(<EventCard event={mockEvent} />);
        expect(screen.getByText('School Gym')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<EventCard event={mockEvent} />);
        expect(screen.getByText('Annual fair with games and food.')).toBeInTheDocument();
    });

    it('handles missing time gracefully', () => {
        const eventWithoutTime = { ...mockEvent, time: '' };
        render(<EventCard event={eventWithoutTime} />);
        // Should not crash, and should not show a broken time format
        // Implementation check: if time is empty, it might not show anything or show a default
        expect(screen.getByText('Spring Fair')).toBeInTheDocument();
    });
});
