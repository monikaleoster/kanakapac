// NEXT_PUBLIC_BASE_URL is only configured for the production custom domain.
// Preview deployments each get a unique, unpredictable *.vercel.app host, so
// for those we fall back to VERCEL_URL — which Vercel injects at runtime
// with the actual host of the deployment currently serving the request.
function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const BASE_URL = resolveBaseUrl();

export function getAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  return `${BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
