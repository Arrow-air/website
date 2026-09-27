---
sidebar_position: 1
title: Token Contracts
description: The ARROW token and the vesting contracts contributors were paid through, and where to find them.
hide_table_of_contents: true
---

# Token Contracts

Arrow keeps its on-chain footprint small. There's the $ARROW token itself, owned by the DAO multisig and open source in the [Arrow-Contracts repository](https://github.com/Arrow-air/Arrow-Contracts). Then there are the vesting escrows that contributors were paid through between 2022 and June 2024, using Yearn's open-source vesting escrow contracts. Arrow no longer vests contributor ARROW and every schedule has fully vested, but anything unclaimed is still in its escrow.

The token lives on Ethereum Mainnet and is bridged to Optimism, where the vesting escrows are.

## In this section

- [API Reference](./api/index.md) lists the deployed addresses and every function and event the contracts expose.
- [Vesting](./guides/vesting.md) explains how to claim any ARROW left in a vesting escrow.

For supply, allocation and how ARROW is used in governance, see the [ARROW Token](/docs/governance/arrow-token) page. The contracts are open to contributions, so if you spot an issue or want to propose a change, open an issue or PR on the Arrow-Contracts repository.
