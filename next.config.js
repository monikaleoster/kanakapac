/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        instrumentationHook: true,
    },
    webpack: (config) => {
        // pdf.js optionally requires the native `canvas` package, which is not used in the browser.
        config.resolve.alias.canvas = false;
        return config;
    },
}

module.exports = nextConfig
