---
sidebar_position: 2
description: The AIP lifecycle — from draft to final.
---

# The AIP Process

The AIP process is defined in [AIP-001](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-001.md), a **Living** AIP that's always up to date. This page covers the practical steps.

## Status Lifecycle

```
Draft → Review → Last Call → Final
                           → Stagnant (no activity 6+ months)
                           → Withdrawn (author pulls it)
```

**Living** is a special final state for proposals that are meant to be continuously updated (like membership lists or the AIP guidelines themselves). **Obsolete** marks proposals superseded by a newer AIP.

## Step-by-Step Walkthrough

### 1. Write a Draft

Clone the [dao-aips repository](https://github.com/Arrow-air/dao-aips) and create a new file using the [AIP template](https://github.com/Arrow-air/dao-aips/blob/main/AIP-template.md). A complete AIP includes:

- **Preamble** — Title, author(s), type, status, created date
- **Abstract** — One or two sentences describing the proposal
- **Motivation** — Why this change is needed
- **Specification** — The full technical or operational description
- **Rationale** — Why this approach over alternatives
- **Backwards Compatibility** — Any impact on existing processes or systems

Open a pull request to the repo with your draft.

### 2. Review

Once the PR is submitted, your AIP enters **Review** status. The community discusses it on the [DAO forum](https://dao.arrowair.com/) and in Discord. AIP Editors check the proposal for completeness and formatting — they don't evaluate the idea itself.

Engage with feedback and revise your AIP in response.

### 3. Last Call

When the author believes the AIP is ready, they request **Last Call** status. This is a final notice to the community — typically lasting a week — to raise any remaining objections before a vote is scheduled.

### 4. Snapshot Vote

After Last Call, an AIP Editor creates the vote on [Snapshot](https://snapshot.org/#/s:arrowair.eth). The vote uses the standard text from AIP-001:

> *"Should AIP-XXX: [Title] be accepted and executed?"*

Vote parameters:
- **Delay**: 1 day after proposal creation
- **Duration**: 7 days
- **Quorum**: 2,000,000 ARROW (including vested tokens)
- **Choices**: For / Against / Abstain

### 5. Final or Withdrawn

If the vote passes quorum and a majority votes **For**, the AIP moves to **Final** (or **Living** if it's meant to be updated over time). A Final AIP is canonical — it cannot be modified. Changes require a new AIP.

If the author withdraws the proposal at any point, it is marked **Withdrawn**. If a Final AIP is replaced by a newer one, it becomes **Obsolete**.

## AIP Editors

AIP Editors are listed in [AIP-003](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-003.md). Their responsibilities:

- Review submitted AIPs for completeness and correct formatting
- Assign AIP numbers
- Create the Snapshot vote once Last Call ends
- Maintain the dao-aips repository

Editors do not have veto power over proposals. Their role is administrative, not evaluative.
