"use client";

import dynamic from "next/dynamic";
import PdfViewerLinks from "./PdfViewerLinks";

interface PdfViewerProps {
  url: string;
  title?: string;
}

// react-pdf and the pdf.js worker are only fetched on pages that show a PDF.
const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">Loading PDF…</p>,
});

export default function PdfViewer({ url, title }: PdfViewerProps) {
  return (
    <div className="my-6 not-prose">
      <div className="mb-2">
        <PdfViewerLinks url={url} />
      </div>
      <PdfViewerInner url={url} title={title} />
    </div>
  );
}
