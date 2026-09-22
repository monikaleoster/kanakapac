import { render, screen, fireEvent } from '@testing-library/react';
import ExternalCoverImageSpec from '@/components/ExternalCoverImageSpec';

describe('ExternalCoverImageSpec', () => {
    it('is collapsed by default', () => {
        render(<ExternalCoverImageSpec title="Fall Fundraiser" />);

        expect(
            screen.getByRole('button', { name: /generate with an external ai tool \(free\)/i })
        ).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText(/1200x630/)).not.toBeInTheDocument();
    });

    it('expands to show the spec text including the article title and constraints', () => {
        render(<ExternalCoverImageSpec title="Fall Fundraiser" />);

        fireEvent.click(
            screen.getByRole('button', { name: /generate with an external ai tool \(free\)/i })
        );

        expect(screen.getByText(/Fall Fundraiser/)).toBeInTheDocument();
        expect(screen.getByText(/1200x630/)).toBeInTheDocument();
        expect(screen.getByText(/do not include any text/i)).toBeInTheDocument();
        expect(screen.getByText(/real, identifiable people/i)).toBeInTheDocument();
    });

    it('copies the templated spec text to the clipboard', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });

        render(<ExternalCoverImageSpec title="Fall Fundraiser" />);
        fireEvent.click(
            screen.getByRole('button', { name: /generate with an external ai tool \(free\)/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /copy to clipboard/i }));

        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Fall Fundraiser'));
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('1200x630'));
        expect(await screen.findByRole('button', { name: /copied!/i })).toBeInTheDocument();
    });
});
