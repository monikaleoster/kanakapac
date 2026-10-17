# Platform pitch one-pager

A one-page pitch for other school PACs, aimed at getting them onto the
multi-school platform described in `.scratch/multi-school-platform/spec.md`.

- `pitch.html` — the source. Edit this, not the PDF.
- `img/` — screenshots captured from the live Kanaka Creek site
  (homepage, events, announcements, minutes).
- `pac-solution-overview.pdf` — the rendered one-pager to send.

Re-render after editing:

```bash
cd docs/pitch
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-pdf-header-footer \
  --allow-file-access-from-files \
  --print-to-pdf=pac-solution-overview.pdf pitch.html
```

It is laid out to fill exactly one Letter page; if you add copy, check the
PDF is still a single page.
