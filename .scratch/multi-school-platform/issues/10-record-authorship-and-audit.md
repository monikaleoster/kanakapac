# 10: Record who created and changed content

**What to build:** Content records which Member created it and which Member last changed it, and the admin interface shows that. Rows migrated from the single-School era have no author and display accordingly.

Article's free-text Author stays exactly as it is: it is display attribution and may credit someone with no login, which is a different thing from the Member who saved the record.

**Blocked by:** 09

**Status:** ready-for-agent

- [ ] Creating content records the acting Member; editing records the last editor
- [ ] Admin surfaces show who last changed a piece of content
- [ ] Content with no recorded author displays sensibly rather than blank or broken
- [ ] Article's free-text Author is unchanged and remains distinct from the creating Member
- [ ] The audit log table is written by the impersonation path in ticket 18
