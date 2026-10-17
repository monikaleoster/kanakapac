# 09: Scope the admin area and authorize every request

**What to build:** A Member signed in at a School's subdomain manages only that School's content. Every admin route and every mutating endpoint checks that the signed-in person holds a membership in the School resolved from the host; a valid session with no membership there is rejected.

This is where the cookie's deliberate breadth is paid for: the browser gives no isolation between Schools, so the check has to be real and it has to be on every request.

**Blocked by:** 05, 08

**Status:** ready-for-agent

- [ ] Admin pages list and edit only the resolved School's content
- [ ] Every admin route and mutating endpoint checks membership in the resolved School
- [ ] An Editor of one School changing the subdomain to another is rejected
- [ ] A valid session with no membership in the resolved School is rejected
- [ ] The isolation spec is extended to cover admin surfaces and cross-School access attempts
- [ ] Uploads are written under the School's path prefix
