export default function FacebookShareButton({ url }: { url: string }) {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
    >
      Share to Facebook
    </a>
  );
}
