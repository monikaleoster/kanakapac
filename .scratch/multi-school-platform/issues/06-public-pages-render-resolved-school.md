# 06: Public pages serve the resolved School's content

**What to build:** The first demoable slice. Visiting a School's subdomain shows that School's homepage, Events, Minutes, Announcements, Articles, Policies, and Team Members. RSVP, subscribe, and the contact form all act on that School.

A parent should be able to use the site end to end without an account, exactly as today, with everything they see belonging to one School.

**Blocked by:** 04, 05

**Status:** ready-for-agent

- [ ] Every public page renders content for the School resolved from the host
- [ ] RSVP submits against the resolved School's Event
- [ ] Subscribe creates a Subscriber for the resolved School
- [ ] The contact form reaches the resolved School's contact address
- [ ] No public page can render content from another School
- [ ] Existing public e2e specs pass when addressed at a School's subdomain
