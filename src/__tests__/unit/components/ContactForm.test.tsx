import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from '@/components/ContactForm';

global.fetch = jest.fn();

function fillForm() {
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hi there' } });
}

describe('ContactForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all four required fields', () => {
        render(<ContactForm />);
        expect(screen.getByLabelText(/your name/i)).toBeRequired();
        expect(screen.getByLabelText(/email address/i)).toBeRequired();
        expect(screen.getByLabelText(/subject/i)).toBeRequired();
        expect(screen.getByLabelText(/message/i)).toBeRequired();
    });

    it('posts form data as JSON to /api/contact', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<ContactForm />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    subject: 'Hello',
                    message: 'Hi there',
                }),
            }));
        });
    });

    it('shows a loading state while the request is in flight', async () => {
        let resolveFetch: (value: unknown) => void = () => {};
        (global.fetch as jest.Mock).mockReturnValue(
            new Promise((resolve) => {
                resolveFetch = resolve;
            })
        );

        render(<ContactForm />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        const button = await screen.findByRole('button', { name: /sending/i });
        expect(button).toBeDisabled();

        resolveFetch({ ok: true, json: async () => ({ success: true }) });
        await screen.findByText(/thank you for your message/i);
    });

    it('shows the success message on a 2xx response', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<ContactForm />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText(/thank you for your message/i)).toBeInTheDocument();
    });

    it('shows an inline error message on a non-2xx response', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Failed to send message' }),
        });

        render(<ContactForm />);
        fillForm();
        fireEvent.click(screen.getByRole('button', { name: /send message/i }));

        expect(await screen.findByText(/failed to send message/i)).toBeInTheDocument();
    });
});
