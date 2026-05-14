import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubscribeForm from '@/components/SubscribeForm';

// Mock fetch
global.fetch = jest.fn();

describe('SubscribeForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders email input and submit button', () => {
        render(<SubscribeForm />);
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('calls API on submit', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<SubscribeForm />);
        const input = screen.getByPlaceholderText(/email/i);
        const button = screen.getByRole('button', { name: /subscribe/i });

        fireEvent.change(input, { target: { value: 'test@example.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/subscribe', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            }));
        });
    });

    it('shows success message', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<SubscribeForm />);
        const input = screen.getByPlaceholderText(/email/i);
        fireEvent.change(input, { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

        expect(await screen.findByText(/subscribed/i)).toBeInTheDocument();
    });

    it('shows error message', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Fail' }),
        });

        render(<SubscribeForm />);
        const input = screen.getByPlaceholderText(/email/i);
        fireEvent.change(input, { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));

        expect(await screen.findByText(/fail/i)).toBeInTheDocument();
    });
});
