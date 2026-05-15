---
sidebar_position: 4
title: Treasury
description: Arrow DAO treasury — holdings, management, and how funds are spent.
---

Arrow's treasury is held on-chain in a Gnosis Safe multisig on Ethereum mainnet. Every transaction requires a passed DAO vote on Snapshot first, whether it's swapping rETH for USDC to cover payroll or funding a new project.

**Treasury address:** [`0x03b5Dc2CE78a7bEe9F66DD619b291595a2E166BB`](https://etherscan.io/address/0x03b5Dc2CE78a7bEe9F66DD619b291595a2E166BB)

## Current holdings

| Asset | Balance | Notes |
|-------|--------:|-------|
| USDC | ~$203,000 | Primary operating currency |
| ETH | ~3.24 ETH | Kept for gas |
| ARROW | ~76,500,000 | DAO's own token reserve |

*Figures as of March 2026. Live balance at the address above.*

The USDC balance is the operational runway: contributor grants, GBC disbursements, and project budgets. The ARROW reserve is held for future incentives, grants, and ecosystem development. It isn't counted as liquid operating capital.

## How the treasury has been managed

Arrow originally funded its treasury with ETH, which was staked into Rocket Pool (rETH) in September 2022 to earn yield while holding. As operations scaled, the DAO voted to convert rETH to USDC in regular tranches to cover bimonthly GBC funding rounds and named project budgets.

The conversion history spans from October 2023 through early 2025, with amounts ranging from 8 to 150 rETH per swap. By 2025, the rETH position had been largely liquidated into USDC to match the pace of contributor spending.

## How money moves

**In:** Arrow's treasury was seeded from the initial token launch. There's no ongoing protocol revenue yet. The DAO operates from its capital reserves.

**Out:** All spending goes through one of two routes:

1. **Snapshot vote → multisig execution**: any new project, treasury swap, or governance decision. The DAO votes, the signers execute.
2. **GBC multisig** ([`0x7cFd3D29fD7b13CA33E49bA6b11b79bEF89e5906`](https://etherscan.io/address/0x7cFd3D29fD7b13CA33E49bA6b11b79bEF89e5906)): the Grants and Bounties Committee holds a separate multisig funded by bimonthly DAO votes. The GBC distributes from there to individual contributors based on approved grants and bounties.

## Governance

No money leaves the main treasury without a Snapshot vote. The quorum threshold is 2,000,000 ARROW. Votes run for 7 days with a 1-day posting delay.

This applies to everything: swapping $8K of rETH, launching a six-month project with a monthly budget, or approving a retroactive token allocation. The full vote history is on [Arrow's Snapshot space](https://snapshot.org/#/s:arrowair.eth) and summarized on the [Voting History](../good-to-know/dao-voting) page.

## Runway

:::note Placeholder
This section will be updated with current runway calculations once spending rate figures are confirmed.
:::

The liquid USDC balance covers approximately **[X months]** of operations at a burn rate of approximately **[$Y/month]**.

Arrow has no protocol revenue yet. That changes if [AIP-009](../aips/aip-index#summary)'s manufacturing protocol ships: on-chain sales of Arrow-designed hardware would route a DAO commission back to the treasury.
