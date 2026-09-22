// On production, VERCEL_PROJECT_PRODUCTION_URL is Vercel's own system env var
// for the project's assigned primary domain — it's always correct and can't
// go stale, so it takes priority over any manually-set override. VERCEL_URL
// is the per-deployment *.vercel.app host; used for preview deployments and
// as a last resort. NEXT_PUBLIC_BASE_URL is a dev/local-only override for
// cases where there's no Vercel env at all.
function resolveBaseUrl(): string {
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
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
