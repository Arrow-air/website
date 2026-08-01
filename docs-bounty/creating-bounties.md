---
sidebar_position: 4
sidebar_label: Creating Bounties
---

# Creating Bounties

*This page is for core contributors and project leads who post bounties. If
you want to **complete** a bounty, see [What are Bounties](/bounty/bounties/what-are-bounties)
and [How to Claim](/bounty/bounties/how-to-claim).*

Bounties live as GitHub issues. The bounty board on this site is generated
from them — there's no separate CMS.

## How the pipeline works

1. **Anyone creates an issue** with the [Bounty issue form](https://github.com/Arrow-air/website/issues/new?template=bounty.yml)
   on the `Arrow-air/website` repo. The form applies the `bounty:proposed`
   label, which the board ignores.
2. **Someone with repo access publishes it** by adding the `bounty` label. This
   is the gate: the form is open to anyone, but only a contributor with triage
   or write access can put a reward on the public board. Your review queue is
   [`label:bounty:proposed`](https://github.com/Arrow-air/website/issues?q=is%3Aissue+is%3Aopen+label%3Abounty%3Aproposed).
3. **The sync workflow** (`Sync bounty board data` in the repo's Actions tab)
   reads every `bounty`-labelled issue, validates it, regenerates the board
   data, and **opens a pull request** with the result.
4. **Merge that PR** and the board updates on the next site deploy.

The workflow opens a PR rather than committing directly because the board
branch requires review — and because merging is what publishes reward amounts
to a public page, so a second pair of eyes is the point rather than an
inconvenience.

Status is derived, not managed by hand:

- **OPEN** — issue open, no assignee
- **CLAIMED** — issue open, has an assignee. Assigning the claimer is how you
  mark it
- **EXPIRED** — issue open, past its expiry date
- **Completed** (CLOSED) — issue closed

## Filling in the form

The form itself blocks submission on five: Category, the board description,
Scope, Deliverables, and Acceptance criteria. A reward is required too, but the
form can't enforce "at least one of two fields" — a bounty with neither is
dropped during sync instead, with a warning in the log. Skip anything else
that doesn't apply.

**Category** (required) — one of the nine [discipline categories](/docs/community/disciplines).
Picks which board section the bounty appears in.

**Project** — which Arrow project this belongs to. Optional; it doesn't appear
on the board, it's for triage.

**Rewards** — numeric amounts only, and **at least one of USDC / ARROW is
required**. A bounty with neither is dropped from the board with a warning in
the workflow log, so if a bounty doesn't appear, check there first.

**Expected completion window** — a rough guide for how long the work should
take once claimed. Optional.

**Expiry date** — optional. Past this date the card shows as EXPIRED and stops
accepting claims.

**Disciplines** — check every discipline a contributor would need. These render
as color-coded tags on the board card and are matched against contributor
profiles, so tag honestly: 1–3 is typical. Tags can span categories; a bounty
filed under Engineering can carry a Manufacturing tag.

**Short bounty board description** (required) — 1–2 sentences for the public
card. Written for someone scanning the board, not for the person doing the work.

**Thumbnail** — optional but worth it: cards with real images get claimed
faster. Drag an image into any comment box to get a URL, then paste it here.

**Scope** (required) — what work is included.

**Deliverables** (required) — what the contributor hands over.

**Acceptance criteria** (required) — the quality bar those deliverables have to
clear. Keep this separate from Deliverables and write it as checkable
statements. It's what settles the "technically delivered, but not good enough"
conversation, and without it you have a contract with no quality clause.

**Reference material** and **Notes & links** — optional. Prior art, non-goals,
things not to change, related issues.

Be specific enough throughout that a stranger can judge whether they can do the
job before claiming it.

## After posting

- Add the **`bounty`** label to publish it.
- Run the **Sync bounty board data** workflow (Actions → Sync bounty board data
  → Run workflow), then **merge the PR it opens**.
- Check the workflow log for `::warning::` lines. A malformed bounty is dropped
  silently rather than failing the run, so a missing card usually means a
  warning you haven't read.
- If the run says **"No bounty data changes"** and opens no PR, that is not the
  same as "nothing to do". A green run with no `::warning::` lines and no PR
  means the job read *zero* issues, which points at the workflow's own
  `permissions:` block rather than at your bounty. Confirm the run can see
  issues before you go hunting for a formatting mistake.
- Announce new bounties in Discord — the board doesn't notify anyone.
- When someone claims: confirm in the issue thread and **assign them**. That's
  what flips the card to CLAIMED, and it only shows after the next sync, so run
  it promptly to avoid two people starting the same work.
- When work is approved and paid: close the issue.

## Editing the taxonomy

The category and discipline options in the issue form are **generated** from
the canonical taxonomy (`src/data/disciplines.json`) — don't edit
`bounty.yml`'s option lists by hand. Taxonomy changes go through community
review; after one lands, regenerate the form with
`node scripts/gen-bounty-form.mjs`.
