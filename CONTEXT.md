# Kanaka PAC Website

The official website for the Parent Advisory Council: event listings, meeting records, announcements, and (new) articles, all managed by a single shared admin login.

## Language

**Article**:
A long-form, admin-authored piece of rich-text content with its own Draft/Published lifecycle.
_Avoid_: Post, blog post, news item

**Draft** / **Published** (Article status):
The two states of an Article's lifecycle. A Draft is saved but not publicly visible; Published is public. This lifecycle belongs to Article alone — Announcement and Minutes are public the moment they exist, with no Draft state.

**Body** (Article):
An Article's full rich-text content, stored as sanitized HTML with embedded inline images.
_Avoid_: Content (reserved for the plain-string field on Announcement and Minutes)

**Excerpt**:
The short plain-text teaser for an Article shown on the listing page, distinct from its Body.
_Avoid_: Summary, teaser, preview

**Cover image**:
The single hero image representing an Article on its listing card and at the top of its detail page.

**Author** (Article):
Free-text attribution entered manually by the admin per Article. Not tied to a login — the site has one shared admin credential, not individual admin accounts.

**Announcement**:
A short, time-sensitive notice with a priority and optional expiry. Always public from creation — has no Draft state.
_Avoid_: Alert, notice

**Minutes**:
The record of a single PAC meeting, keyed by meeting date, stored as plain text.
_Avoid_: Meeting notes

**Subscriber**:
A person who receives email notifications when new content is published. One shared list reused across Announcements and Articles, not per-content-type.

**publishedAt**:
A timestamp field present on both Announcement and Article, with different meanings per entity: on Announcement it marks creation (announcements have no Draft state, so creation and publishing are the same moment); on Article it marks the transition from Draft to Published.
