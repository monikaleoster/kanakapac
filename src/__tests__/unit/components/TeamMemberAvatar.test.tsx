import { render, screen } from '@testing-library/react';
import TeamMemberAvatar from '@/components/TeamMemberAvatar';

describe('TeamMemberAvatar', () => {
    it('renders the photo with the member name as alt text', () => {
        render(<TeamMemberAvatar name="Jane Doe" photoUrl="https://cdn.example.com/jane.jpg" />);

        const img = screen.getByRole('img', { name: 'Jane Doe' });
        expect(img).toHaveAttribute('src', 'https://cdn.example.com/jane.jpg');
        expect(img.className).toContain('object-cover');
    });

    it('falls back to initials when there is no photo', () => {
        render(<TeamMemberAvatar name="Jane Marie Doe" />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByTestId('team-member-initials')).toHaveTextContent('JM');
    });
});
