# PAC Solution

A platform hosting a public website for each school's Parent Advisory Council: event listings, meeting records, announcements, and articles. Each School manages its own content through its own Members; parents read it without an account.

## Language

### Tenancy

**School**:
The tenant. A school whose PAC publishes through the platform, holding its own subdomain, branding, contact details, and content, and seeing nothing belonging to any other School.
_Avoid_: tenant, organization, site, client, customer, account

**PAC**:
The Parent Advisory Council of a School — the body that meets, keeps Minutes, and publishes to parents. Exactly one per School. The PAC's name is displayed alongside the School's and is often different, but the School is what the system owns content against.
_Avoid_: using PAC to mean the tenant itself

**Slug**:
The permanent subdomain label a School is reached at. Chosen when the School is created and never changed thereafter.
_Avoid_: handle, tenant id, subdomain name

**Suspension**:
A state in which a School's public site shows a temporarily-unavailable notice and its Members cannot publish, while all its content is retained. Reversible, and distinct from deletion, which is permanent.
_Avoid_: disable, deactivate, archive

### People and access

**Member**:
A person who can sign in to a particular School. Membership is held per School, so one person may be a Member of several, and each Membership carries its own role.
_Avoid_: Admin, user, account, login

**Owner**:
A Member role that can manage who belongs to the School, in addition to everything an Editor can do. A School always has at least one.
_Avoid_: administrator, manager, chair

**Editor**:
A Member role that can create and edit the School's content but cannot change who has access.
_Avoid_: contributor, author (reserved for Article attribution)

**Superadmin**:
The platform operator. Creates, suspends, exports, and deletes Schools, and is never a Member of one.
_Avoid_: admin, root, owner

**Impersonation**:
The Superadmin working inside a School on its behalf, rather than through any privileged shortcut. Always recorded, so a School can see what was done for it.
_Avoid_: sudo, masquerade, switch user, act as

**Team Member**:
A person listed publicly as part of a School's PAC executive. Unrelated to Membership: a Team Member need not be able to sign in, and a Member need not appear on the team page.
_Avoid_: confusing with Member; exec, officer

### Content

**Article**:
A long-form, Member-authored piece of rich-text content with its own Draft/Published lifecycle.
_Avoid_: Post, blog post, news item

**Draft** / **Published** (Article status):
The two states of an Article's lifecycle. A Draft is saved but not publicly visible; Published is public. This lifecycle belongs to Article alone — Announcement and Minutes are public the moment they exist, with no Draft state.

**Body** (Article):
An Article's full rich-text content, stored as sanitized HTML with embedded inline images. It may also contain embedded PDF links (see **Embedded PDF**).
_Avoid_: Content (reserved for the plain-string field on Announcement)

**PDF viewer**:
The inline, scrollable, lazy-loaded display of a PDF on a public page, with "Open in new tab" and "Download" links. Used for Minutes whose document is a PDF and for Embedded PDFs in an Article Body.

**Embedded PDF** (Article):
A PDF placed in an Article Body as an anchor to the PDF URL marked `data-pdf-viewer`. The public Article page shows it in the PDF viewer; emails and no-JavaScript views show a plain link.

**Excerpt**:
The short plain-text teaser for an Article shown on the listing page, distinct from its Body.
_Avoid_: Summary, teaser, preview

**Cover image**:
The single hero image representing an Article on its listing card and at the top of its detail page.

**Author** (Article):
Free-text attribution displayed on an Article, entered by hand. Distinct from the Member who created it, which is recorded but not shown — an Article may credit someone who has no login at all.
_Avoid_: conflating Author with the Member who wrote it

**Announcement**:
A short, time-sensitive notice with a priority and optional expiry. Always public from creation — has no Draft state.
_Avoid_: Alert, notice

**Minutes**:
The record of a single PAC meeting, keyed by meeting date, backed by an uploaded document (PDF, DOC, DOCX, or TXT).
_Avoid_: Meeting notes

**Subscriber**:
A person who receives email notifications when a School publishes new content. Subscriptions belong to a single School: the same address may subscribe to several independently, and unsubscribing from one leaves the others untouched.
_Avoid_: follower, mailing list member

**publishedAt**:
A timestamp field present on both Announcement and Article, with different meanings per entity: on Announcement it marks creation (announcements have no Draft state, so creation and publishing are the same moment); on Article it marks the transition from Draft to Published.
