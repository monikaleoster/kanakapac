# 05: Notification send does not fan out in-request

**What to build:** `src/app/api/send-email/route.ts:33-57` loops over every
subscriber and awaits one `sendEmail` per iteration inside the request. Send
time grows linearly with the list, so the route will eventually exceed the
serverless function timeout, having sent to some prefix of the list with no
record of where it stopped. The partial result is reported as
`success: true` with a `sentCount`, so a timeout — which returns no body at all
— is indistinguishable to the caller from never having started.

**This is filed needs-triage rather than ready-for-agent because the right fix
depends on decisions that are not made.** Options range from batching through
the provider's bulk API, to a queue with retries, to chunking across several
requests with progress persisted. Which one is appropriate depends on how large
a list the platform expects to serve, and that is a multi-school question rather
than a Kanaka one: one school's list is small enough that the current code works,
and the ticket exists because the conversion makes it N schools' lists.

**What to settle before implementation:** the expected maximum list size, whether
a send must be resumable after a failure, and whether a School Owner needs to see
delivery results after the request that triggered the send has ended. The last
one decides whether this needs durable state or only a longer-running job.

Worth noting it is not urgent for Kanaka at its current list size, and the
review found no evidence of it having failed. It is logged so that the
conversion does not inherit it unexamined, since #49 and #50 are already about
public endpoints being unthrottled and this is the admin-side counterpart.

**Blocked by:** None, but should not be implemented before the questions above
are answered.

**Status:** needs-triage

- [ ] Expected maximum subscriber list size per School is recorded
- [ ] Whether a send must be resumable after partial failure is decided
- [ ] Whether delivery results must outlive the triggering request is decided
- [ ] An approach is chosen and this ticket is re-filed as ready-for-agent with
      acceptance criteria matching it
