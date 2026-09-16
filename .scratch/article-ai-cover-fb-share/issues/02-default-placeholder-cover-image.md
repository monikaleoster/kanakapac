# 02: Default placeholder cover image

**What to build:** Articles with no cover image set show a checked-in placeholder image everywhere a cover would otherwise render, instead of a bare/broken spot — in the admin editor's preview, on the public listing card, and on the article detail page hero.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A placeholder cover image asset (1200×630) is added to the repo.
- [ ] The admin Article editor's cover image preview shows the placeholder when no `coverImageUrl` is set.
- [ ] The public Article listing card shows the placeholder for Articles with no `coverImageUrl`.
- [ ] The public Article detail page hero shows the placeholder for Articles with no `coverImageUrl`.
- [ ] Setting a real cover image (via upload or generation) still overrides the placeholder exactly as before.
