---
sidebar_position: 4
description: Step-by-step guide to writing and submitting an AIP.
---

# Submit an AIP

Anyone can submit an Arrow Improvement Proposal. The process is defined in [AIP-001](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-001.md). Read it first if you want the full detail. This page is the practical walkthrough.

## 1. Read AIP-001 and existing proposals

[AIP-001](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-001.md) is the canonical guide to the AIP process, formatting requirements, and style conventions. It's a Living AIP, so it's always up to date. Then browse the [AIP Index](./aip-index) to understand what's already been established — your proposal should build on the existing framework, not duplicate it.

## 2. Discuss your idea first

Before writing a formal proposal, post your idea in the [DAO forum](https://dao.arrowair.com/) or raise it in Discord. Early feedback surfaces objections before you've invested time in writing, and it gives the community a heads-up before the formal vote.

## 3. Write your AIP

Clone the [dao-aips repository](https://github.com/Arrow-air/dao-aips) and copy the [AIP template](https://github.com/Arrow-air/dao-aips/blob/main/AIP-template.md). A complete AIP includes:

- **Preamble** — Title, author(s), type, status (`Draft`), and creation date
- **Abstract** — One or two sentences describing what the proposal does
- **Motivation** — Why this change is needed and what problem it solves
- **Specification** — The full operational or technical description of the change
- **Rationale** — Why this approach over alternatives
- **Backwards Compatibility** — Any impact on existing processes, contracts, or systems

Name your file `AIP-XXX.md` — AIP Editors will assign the number. Use the same zero-padded three-digit format as existing AIPs (e.g. `AIP-010.md`).

## 4. Open a pull request

Submit a PR to the [dao-aips repository](https://github.com/Arrow-air/dao-aips). AIP Editors will review the PR for formatting and completeness, then merge it with **Draft** status. They won't evaluate whether the idea is good — that's for the community.

## 5. Engage during Review

Once merged, your AIP enters **Review** status. A corresponding thread should exist (or be created) on the [DAO forum](https://dao.arrowair.com/). Respond to questions, revise the proposal based on feedback, and keep the community updated on any changes.

## 6. Request Last Call

When you believe the AIP is ready and feedback has been addressed, ask an AIP Editor to move it to **Last Call**. This is a final notice period — typically one week — for any remaining objections before the vote is scheduled.

## 7. Snapshot vote

After Last Call, an AIP Editor creates the vote on [Snapshot](https://snapshot.org/#/s:arrowair.eth). The vote runs for 7 days (with a 1-day delay), requires 2,000,000 ARROW quorum, and uses **For / Against / Abstain** choices.

If the vote passes, your AIP is marked **Final** (or **Living** if it's meant to be updated over time) and becomes part of how Arrow operates.
