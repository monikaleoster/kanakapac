import { render, screen } from '@testing-library/react';

jest.mock('@/lib/data', () => ({
    getMinutesById: jest.fn(),
    getMinutes: jest.fn(),
}));

jest.mock('@/components/PdfViewer', () => {
    return function MockPdfViewer({ url }: { url: string }) {
        return <div data-testid="pdf-viewer" data-url={url} />;
    };
});

jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NOT_FOUND');
    }),
}));

import { getMinutesById } from '@/lib/data';
import MinutesDetailPage from '@/app/minutes/[id]/page';

const mockGetMinutesById = getMinutesById as jest.Mock;

async function renderWithFile(fileUrl: string) {
    mockGetMinutesById.mockResolvedValue({
        id: 'm1',
        title: 'March Meeting',
        date: '2026-03-01',
        fileUrl,
        createdAt: '2026-03-01T10:00:00Z',
    });
    render(await MinutesDetailPage({ params: Promise.resolve({ id: 'm1' }) }));
}

describe('MinutesDetailPage', () => {
    it('renders the inline viewer for a PDF', async () => {
        await renderWithFile('https://cdn.example.com/minutes/a.pdf');

        expect(screen.getByTestId('pdf-viewer')).toHaveAttribute(
            'data-url',
            'https://cdn.example.com/minutes/a.pdf'
        );
        expect(screen.queryByText('View Document')).not.toBeInTheDocument();
    });

    it('detects PDFs case-insensitively and ignoring the query string', async () => {
        await renderWithFile('https://cdn.example.com/minutes/A.PDF?token=1');

        expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });

    it('keeps the View Document link for a DOCX', async () => {
        await renderWithFile('https://cdn.example.com/minutes/a.docx');

        expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
        expect(screen.getByText('View Document').closest('a')).toHaveAttribute(
            'href',
            'https://cdn.example.com/minutes/a.docx'
        );
    });

    it('shows the empty message when there is no document', async () => {
        await renderWithFile('');

        expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
        expect(screen.getByText('No document yet')).toBeInTheDocument();
    });
});
