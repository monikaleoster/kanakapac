import { render, screen } from '@testing-library/react';

jest.mock('@/lib/data', () => ({
    getArticleById: jest.fn(),
}));

jest.mock('@/components/PdfViewer', () => {
    return function MockPdfViewer({ url, title }: { url: string; title?: string }) {
        return <div data-testid="pdf-viewer" data-url={url} data-title={title} />;
    };
});

jest.mock('@/components/FacebookShareButton', () => function FacebookShareButton() {
    return <div />;
});
jest.mock('@/components/ArticleCoverImage', () => function ArticleCoverImage() {
    return <div />;
});
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NOT_FOUND');
    }),
}));

import { getArticleById } from '@/lib/data';
import ArticleDetailPage from '@/app/articles/[id]/page';

async function renderWithBody(body: string) {
    (getArticleById as jest.Mock).mockResolvedValue({
        id: 'a1',
        title: 'Article',
        author: 'Author',
        excerpt: 'Excerpt',
        body,
        status: 'published',
        publishedAt: '2026-01-01T10:00:00Z',
        createdAt: '2026-01-01T10:00:00Z',
    });
    render(await ArticleDetailPage({ params: Promise.resolve({ id: 'a1' }) }));
}

describe('ArticleDetailPage embedded PDFs', () => {
    it('replaces data-pdf-viewer anchors with the viewer, using the anchor text as title', async () => {
        await renderWithBody(
            '<p>Before</p><p><a href="https://cdn.example.com/minutes/a.pdf" data-pdf-viewer="true">Agenda</a></p><p>After</p>'
        );

        const viewer = screen.getByTestId('pdf-viewer');
        expect(viewer).toHaveAttribute('data-url', 'https://cdn.example.com/minutes/a.pdf');
        expect(viewer).toHaveAttribute('data-title', 'Agenda');
        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
    });

    it('leaves no empty paragraphs around an embedded PDF', async () => {
        await renderWithBody(
            '<p><a href="https://cdn.example.com/a.pdf" data-pdf-viewer="true">Agenda</a></p><p>After</p>'
        );

        expect(document.querySelectorAll('p:empty')).toHaveLength(0);
    });

    it('keeps normal anchors as links', async () => {
        await renderWithBody('<p><a href="https://example.com">Plain</a></p>');

        expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
        expect(screen.getByText('Plain').closest('a')).toHaveAttribute('href', 'https://example.com');
    });

    it('does not render a viewer for an unsanitary javascript: href', async () => {
        await renderWithBody('<a href="javascript:alert(1)" data-pdf-viewer="true">Bad</a>');

        expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
    });
});
