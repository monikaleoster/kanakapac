# 21: Integrate, verify, and prepare the cutover

**What to build:** The point at which green is actually promised. The full suite passes on the branch, the two-School isolation seam passes against both public and admin surfaces, and the cutover runbook is written and rehearsed against staging.

The runbook covers the steps no ticket owns individually: wildcard DNS and certificate validation for the apex, the permanent redirect from the old domain, verifying the sending domain, the order of the three migrations, and enrolling the Superadmin's authenticator with recovery codes stored offline before anything else.

**Blocked by:** all preceding tickets

**Status:** ready-for-agent

- [ ] The full unit and e2e suite passes on the branch
- [ ] The isolation seam passes across public and admin surfaces
- [ ] A cutover runbook exists covering DNS, certificate validation, the redirect, sending-domain verification, migration order and verification, and authenticator enrolment
- [ ] The runbook has been rehearsed end to end against staging
- [ ] The maintenance window is estimated and scheduled away from an event or meeting week
- [ ] Issues #48, #49 and #50 are confirmed as the remaining gate before a second School is onboarded
