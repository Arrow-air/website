---
sidebar_position: 2
title: Vesting Contracts
---

# Vesting Contracts

Between 2022 and June 2024, contributors could be paid in ARROW that unlocked over time. Each vesting schedule was its own escrow contract on Optimism, created by the vesting escrow factory and funded when it was created. Arrow no longer vests contributor ARROW, and every schedule has now fully vested. If you had one, anything you haven't claimed is still in your escrow, and you can collect it at any time. Once claimed, ARROW can stay on Optimism or be bridged back to Ethereum Mainnet.

Addresses and full function details are in the [API reference](../api/index.md).

## Claiming your ARROW

1. Find your escrow address. The factory emitted a `VestingEscrowCreated` event for every escrow, with the recipient indexed, so filtering the factory's events on [Optimistic Etherscan](https://optimistic.etherscan.io/address/0xB93427b83573C8F27a08A909045c3e809610411a#events) by your wallet address shows each escrow created for you. If you're unsure, ask in Discord.
2. Open the escrow and call `unclaimed()` on the Read Contract tab to see how much is left to claim.
3. Connect your wallet on the Write Contract tab and call `claim()`. Only the recipient can claim. With no arguments it sends everything available to your own address; you can also pass a different `beneficiary` address, and an `amount` to claim part of it.
