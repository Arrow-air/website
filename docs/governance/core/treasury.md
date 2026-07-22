---
sidebar_position: 4
title: Treasury
description: Arrow DAO treasury — holdings, management, and how funds are spent.
---

Arrow's treasury is held on-chain in a Gnosis Safe multisig on Ethereum mainnet. Every transaction requires a passed DAO vote on Snapshot first, whether it's swapping rETH for USDC to cover payroll or funding a new project.

**Treasury address:** [`0x03b5Dc2CE78a7bEe9F66DD619b291595a2E166BB`](https://etherscan.io/address/0x03b5Dc2CE78a7bEe9F66DD619b291595a2E166BB)

## Holdings

The treasury holds three kinds of assets: **USDC** (the primary operating currency for contributor grants, GBC disbursements, and project budgets), a small amount of **ETH** for gas, and roughly **76.5M $ARROW** — the DAO's own token reserve, about 76% of total supply. Live balances are always visible at the address above.

## $ARROW deployment

How the token reserve can be used is governed by [AIP-010 (Tokenomics V1)](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-010.md): each year the DAO votes on a deployment cap splitting authorized $ARROW across grants, manufacturing rewards, and project funding. The Year 1 (2026) cap is 5,000,000 $ARROW. Any conversion of treasury $ARROW to USDC requires its own governance vote covering the mechanics of the transaction. See [The $ARROW Token](../arrow-token) for details.

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

## Funding operations

Arrow doesn't have protocol revenue yet, so operations are funded from treasury reserves. Two paths exist:

1. **Authorized $ARROW sales** — under AIP-010, the DAO can vote to convert treasury $ARROW from the project funding bucket into USDC to finance approved project budgets.
2. **Manufacturing commissions** — once [AIP-009](../aips/aip-index#summary)'s manufacturing protocol is fully live, on-chain sales of Arrow-designed hardware route a DAO commission back to the treasury.
