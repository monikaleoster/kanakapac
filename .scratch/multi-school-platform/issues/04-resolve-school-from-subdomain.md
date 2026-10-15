# 04: Resolve the School from the request subdomain

**What to build:** Every request learns which School it is for, resolved once from the leading label of the host and made available downstream. The apex host is not a School and serves no School-scoped route. An unrecognised slug returns a 404 linking back to the apex.

Local development and the test suite address Schools the same way production does, so tenant routing is genuinely exercised rather than bypassed.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] A request to a known slug resolves to that School, once per request
- [ ] An unknown slug returns a 404 that links to the apex
- [ ] The apex host serves no School-scoped route
- [ ] School lookup by slug is cached, with invalidation on create, suspend and delete
- [ ] Schools are reachable locally at `<slug>.localhost`
- [ ] The e2e suite builds per-School URLs instead of using one base URL
- [ ] Safari's lack of `*.localhost` support is documented for contributors
