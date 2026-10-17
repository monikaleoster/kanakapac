# 08: Sign in by magic link, as a real person

**What to build:** The shared password is replaced by real identities. A Member receives an emailed link, clicks it, and is signed in. The session cookie is scoped to the parent domain, so one sign-in covers every School that person belongs to.

Per ADR-0004 this removes stored passwords for Members entirely and closes issue #51 for them. The Superadmin's break-glass path is ticket 17.

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] A Member signs in by clicking an emailed link
- [ ] The session cookie is scoped to the parent domain and covers all subdomains
- [ ] A person who is a Member of two Schools signs in once
- [ ] The session establishes identity only; it grants no School access by itself
- [ ] The e2e auth fixture signs in without a live inbox, via a path that is absent or inert in production builds and fails closed when the environment cannot be positively identified as test
- [ ] A test asserts that path is unavailable in a production-like build
- [ ] Sign-in email uses the parameterized sender
