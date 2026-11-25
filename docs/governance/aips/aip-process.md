---
mdx:
  format: mdx
sidebar_position: 2
description: The AIP lifecycle, from first idea to a Final vote.
---

import { AipLifecycle } from '@site/src/components/ArrowDiagrams';

# The AIP Process

An Arrow Improvement Proposal (AIP) is how a big change becomes official: a new committee, a new standard, a change to how the DAO runs. The process is defined in [AIP-001](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-001.md), a **Living** AIP that stays up to date. This page is the practical version.

<AipLifecycle />

:::tip Proposing a project?
Funded projects follow a lighter path under AIP-006: a forum post and a Snapshot vote that adds the project to AIP-007. See [Proposing a project](/docs/governance/aips/submit-an-aip#proposing-a-project).
:::

## Step by Step

### 1. Test the idea

Before writing anything formal, share the idea on [Discord](https://discord.com/invite/arrow) or the [DAO Forum](https://dao.arrowair.com/). It's the fastest way to find out whether people want it, who else cares, and what you haven't thought of yet.

### 2. Write a Draft

Clone the [dao-aips repository](https://github.com/Arrow-air/dao-aips) and start from the [AIP template](https://github.com/Arrow-air/dao-aips/blob/main/AIP-template.md). A complete AIP includes:

- **Preamble**: title, author(s), type, status and created date
- **Abstract**: the proposal in one or two sentences
- **Motivation**: why the change is needed
- **Specification**: the full technical or operational detail
- **Rationale**: why this approach over the alternatives
- **Backwards Compatibility**: any effect on existing processes or systems

Open a pull request with your draft. An AIP Editor merges it as a **Draft** once it's properly formatted, and assigns its number.

### 3. Review

Mark the AIP ready for **Review** and the community discusses it on the forum and in Discord. This is where most of the work happens: answer questions, take feedback and revise. AIP Editors check completeness and formatting. They don't judge the idea itself.

Review ends with an informal **sentiment poll** to check that the community is broadly behind the proposal as written.

### 4. Last Call

If the poll is positive and the feedback has been dealt with, the AIP Editors announce **Last Call**: the community's final chance to suggest amendments. If substantial changes come up, the AIP goes back to Review. If not, it's ready for a vote.

### 5. Snapshot Vote

An AIP Editor creates the vote on [Snapshot](https://snapshot.org/#/s:arrowair.eth). AIP-001 recommends these headings for the vote text: a brief description, the rationale, the outcome if the vote passes, the outcome if it doesn't, relevant resource and discussion links, and a link to the latest version of the AIP on GitHub.

Vote parameters:

- **Delay**: 1 day after the proposal is created
- **Duration**: 7 days
- **Quorum**: 2,000,000 ARROW (including vested tokens)
- **Choices**: For / Against / Abstain

### 6. The Outcome

If the vote passes, the AIP becomes **Final**, or **Living** if it's meant to keep being updated. A Final AIP is canonical and can't be edited; changing it takes a new AIP. When a newer AIP replaces it, it becomes **Obsolete**.

If the vote doesn't pass, the AIP returns to **Draft** if work continues, or becomes **Stagnant** if it doesn't. A Draft or Review left inactive too long also becomes Stagnant, and can be revived by asking an AIP Editor. Authors can withdraw their AIP at any point, and it's marked **Withdrawn**.

## AIP Editors

AIP Editors are listed in [AIP-003](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-003.md). They:

- Check submitted AIPs for completeness and formatting
- Assign AIP numbers
- Announce Last Call and create the Snapshot vote
- Maintain the dao-aips repository

Editors have no veto. Their role is administrative, not a judgment on the idea.
