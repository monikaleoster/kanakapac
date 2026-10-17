# 02: Unsubscribe links cannot be forged or enumerated

**What to build:** `generateUnsubscribeUrl` at `src/lib/resend.ts:89-92` builds
its token as `Buffer.from(email).toString('base64url')`, and
`src/app/api/unsubscribe/route.ts:13` decodes it straight back. That is an
encoding, not a credential: anyone can unsubscribe any address by base64url
encoding it, and the space is enumerable. Replace it with a random secret
stored per subscription, so possessing the link proves nothing but having
received the email.

**Old links in already-sent mail will stop working.** Every newsletter sent to
date carries a base64 link, and unsubscribing has to keep working for the people
holding those — a broken unsubscribe link is both a support problem and a
compliance one under CASL. So the cutover needs deciding, not just the scheme:
either accept legacy tokens for a stated window while issuing new ones, or
backfill a token per existing subscriber and accept that previously-sent links
break. The first is recommended; whichever is chosen should be written into the
ticket's Comments before implementation, because it is the part that cannot be
undone once mail is sent.

This also unblocks a requirement the conversion already has. `spec.md` for the
multi-school work states that "unsubscribe tokens are per subscription, so
unsubscribing from one School does not affect another" — which a function of the
email address alone cannot express, since the same address subscribing to two
Schools derives the same token for both. Doing it here means ticket 05 of the
conversion adds `school_id` to a table that already has the right shape.

**Blocked by:** None. Lands on `main` before the conversion branch starts.

**Status:** ready-for-agent

- [ ] Each subscription carries its own random, unguessable token
- [ ] The token is generated with a cryptographic random source, not derived
      from the email address or any other guessable input
- [ ] An unsubscribe request with a token that does not match a subscription is
      rejected without revealing whether the address exists
- [ ] Unsubscribing removes only the subscription the token identifies
- [ ] The decision on legacy base64 links is recorded in Comments and
      implemented as recorded
- [ ] A test covers a forged token, a valid token, and a reused token
