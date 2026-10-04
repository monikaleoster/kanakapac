"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Served from /public (copied from pdfjs-dist by the postinstall script):
// bundling the .mjs worker breaks Next 14's minifier.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerInnerProps {
  url: string;
  title?: string;
}

const PAGE_PLACEHOLDER_RATIO = 1.3;

function LazyPage({ pageNumber, width }: { pageNumber: number; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mb-3 bg-white shadow-sm"
      style={{ minHeight: visible ? undefined : width * PAGE_PLACEHOLDER_RATIO }}
    >
      {visible && <Page pageNumber={pageNumber} width={width} />}
    </div>
  );
}

export default function PdfViewerInner({ url, title }: PdfViewerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return (
      <p role="alert" className="text-sm text-red-600">
        The PDF could not be displayed. Please use the links above to open or
        download it.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={title ? `PDF: ${title}` : "PDF document"}
      className="h-[80vh] overflow-y-auto bg-gray-100 rounded-md border border-gray-200"
    >
      {width > 0 && (
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setFailed(true)}
          onSourceError={() => setFailed(true)}
          loading={<p className="p-4 text-sm text-gray-500">Loading PDF…</p>}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <LazyPage key={i + 1} pageNumber={i + 1} width={width} />
          ))}
        </Document>
      )}
    </div>
  );
}
