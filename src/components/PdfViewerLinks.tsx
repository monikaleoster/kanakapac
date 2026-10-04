interface PdfViewerLinksProps {
  url: string;
}

export default function PdfViewerLinks({ url }: PdfViewerLinksProps) {
  const linkClass = "text-primary-600 hover:text-primary-800 font-medium";
  return (
    <div className="flex gap-4 text-sm not-prose">
      <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Open in new tab
      </a>
      <a href={url} download className={linkClass}>
        Download
      </a>
    </div>
  );
}
