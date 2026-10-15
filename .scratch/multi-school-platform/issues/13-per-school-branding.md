# 13: Each School's site looks like its own

**What to build:** A School's settings hold its school name, PAC name, logo, a single accent colour, and its address and contact details, all editable by its Members and shown across its public site.

With custom domains ruled out by ADR-0002, this is the whole of a School's identity, so it has to be convincing.

**Blocked by:** 05, 09

**Status:** ready-for-agent

- [ ] Settings are per School and editable by that School's Members
- [ ] School name, PAC name, logo, accent colour, address and contact details are all settable
- [ ] The public site reflects the School's branding throughout
- [ ] A newly created School has sensible defaults and never renders broken
- [ ] The accent colour cannot produce unreadable contrast
