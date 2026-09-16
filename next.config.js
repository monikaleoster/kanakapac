/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        instrumentationHook: true,
        // isomorphic-dompurify (jsdom) bundles a default-stylesheet.css asset
        // that Next's server bundler mis-traces to .next/browser/, causing an
        // ENOENT during "Collecting page data". Keep it external so it's
        // required from node_modules at runtime instead of bundled.
        serverComponentsExternalPackages: ["jsdom", "isomorphic-dompurify"],
    },
}

module.exports = nextConfig
