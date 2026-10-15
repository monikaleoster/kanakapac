# 05: Require a School on every data accessor

**What to build:** Every read and write in the data layer takes a School, enforced by the accessor's signature, so calling one without a School does not compile. The unscoped client becomes confined to Superadmin provisioning and export paths.

This is the real isolation guarantee described in ADR-0003. Row Level Security is a limiter on a leaked client key, not the mechanism — server-side queries use the service role and bypass it, so the type signature is what actually holds the line.

**Blocked by:** 01, 03

**Status:** ready-for-agent

- [ ] Every accessor in all nine modules requires a School
- [ ] An accessor call without a School fails to compile
- [ ] No module outside Superadmin provisioning and export reaches the unscoped client
- [ ] A unit test enumerates the resource modules and asserts each accessor filters by School and rejects a missing one
- [ ] Callers pass the School resolved from the request
