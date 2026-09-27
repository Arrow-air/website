---
sidebar_position: 1
title: Token Contracts
description: The ARROW token and vesting contracts, what they do, and where to find them.
hide_table_of_contents: true
---

# Token Contracts

Arrow keeps its on-chain footprint small. There's the $ARROW token itself, owned by the DAO multisig and open source in the [Arrow-Contracts repository](https://github.com/Arrow-air/Arrow-Contracts). Then there are vesting escrows, which let contributors be paid in ARROW that unlocks over time. These use Yearn's open-source vesting escrow contracts rather than Arrow's own code.

The token lives on Ethereum Mainnet and is bridged to Optimism, where the vesting escrows live.

## In this section

- [API Reference](./api/index.md) lists the deployed addresses and every function and event the contracts expose.
- [Vesting](./guides/vesting.md) walks through claiming, creating and cancelling a vesting schedule.

For supply, allocation and how ARROW is used in governance, see the [ARROW Token](/docs/governance/arrow-token) page. The contracts are open to contributions, so if you spot an issue or want to propose a change, open an issue or PR on the Arrow-Contracts repository.
