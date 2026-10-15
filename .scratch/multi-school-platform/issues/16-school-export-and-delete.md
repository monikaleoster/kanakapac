# 16: A School can leave with its records

**What to build:** The Superadmin produces an export of a School: a zip holding one CSV per resource, the School's uploaded files under their original relative paths, and a manifest naming the School, the export date, and row counts. Deleting a School requires an export to have been produced and the slug typed to confirm, then destroys its content and files.

The slug itself is retained as a tombstone and never reissued, so old links can never resolve to a different School's content.

**Blocked by:** 11

**Status:** ready-for-agent

- [ ] Export produces a zip of one CSV per resource plus the School's files and a manifest
- [ ] Each Article's Body is written as its own HTML file beside the CSVs and referenced from the CSV, rather than crammed into a cell
- [ ] Deletion requires a prior export and the slug typed to confirm
- [ ] Deletion destroys the School's content and files
- [ ] The deleted slug is retained as a tombstone and rejected for any future School
- [ ] Deletion is reachable only by the Superadmin
