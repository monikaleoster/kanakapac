// Copies the pdf.js worker into /public so it is served as a static file.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}
