---
sidebar_position: 4
sidebar_label: Creating Bounties
---

# Creating Bounties

*This page is for core contributors and project leads who post bounties. If
you want to **complete** a bounty, see [What are Bounties](/bounty/bounties/what-are-bounties)
and [How to Claim](/bounty/bounties/how-to-claim).*

Bounties live as GitHub issues. The bounty board on this site is generated
from them — there's no separate CMS. Post a well-formed issue and the board
updates itself.

## How the pipeline works

1. **Create an issue** with the [Bounty issue form](https://github.com/Arrow-air/website/issues/new?template=bounty.yml)
   on the `Arrow-air/website` repo. The form applies the `bounty` label
   automatically.
2. **The sync workflow** (`Sync bounty board data` in the website repo's
   Actions tab) reads every `bounty`-labelled issue, validates it, and
   regenerates the board data. Run it after posting or editing bounties.
3. **The board renders** each bounty under its category, with discipline tags,
   reward pills, and links back to the issue.

Status is derived, not managed by hand:

| Board status | Derived from |
|---|---|
| **OPEN** | Issue open, no assignee |
| **CLAIMED** | Issue open, has an assignee — assign the claimer to mark it |
| **EXPIRED** | Issue open, past its expiry date |
| **Completed** (CLOSED) | Issue closed |

## Filling in the form

**Category** — one of the nine [discipline categories](/docs/community/disciplines).
Picks which board section the bounty appears in.

**Disciplines** — check every discipline a contributor would need. These render
as tags on the board card and are matched against contributor profiles, so tag
honestly: 1–3 is typical.

**Rewards** — numeric amounts only, at least one of USDC / ARROW. The sync
validates this; a bounty with no reward is skipped with a warning.

**Short bounty board description** — 1–2 sentences for the public card. Written
for someone scanning the board, not for the person doing the work.

**Spec fields** (Summary, Reference material, Scope, Deliverables, Acceptance
criteria, Constraints) — the actual work definition. Be specific enough that a
stranger can judge whether they can do the job before claiming it. Acceptance
criteria are what reviewers use to approve payment — write them as checkable
statements.

**Thumbnail** — optional but worth it: cards with real images get claimed
faster. Drag an image into the issue editor and copy the generated URL into
the field.

## After posting

- Run the **Sync bounty board data** workflow (Actions → Sync bounty board
  data → Run workflow) so the board picks it up.
- Announce new bounties in Discord — the board doesn't notify anyone.
- When someone claims: confirm in the issue thread and **assign them** — that's
  what flips the board card to CLAIMED.
- When work is approved and paid: close the issue.

## Editing the taxonomy

The category and discipline options in the issue form are **generated** from
the canonical taxonomy (`src/data/disciplines.json`) — don't edit
`bounty.yml`'s option lists by hand. Taxonomy changes go through community
review; after one lands, regenerate the form with
`node scripts/gen-bounty-form.mjs`.
