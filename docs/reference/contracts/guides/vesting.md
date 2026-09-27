---
sidebar_position: 2
title: Vesting Contracts
---

# Vesting Contracts

Contributors can be paid in ARROW that unlocks over time. Each vesting schedule is its own escrow contract on Optimism, created by the vesting escrow factory and funded with ARROW when it's created. Tokens vest linearly from a start date to an end date, optionally after a cliff, and the recipient claims them whenever they like. Once claimed, ARROW can stay on Optimism or be bridged back to Ethereum Mainnet.

Addresses and full function details are in the [API reference](../api/index.md).

## Claiming vested tokens

This is the part most contributors need.

1. Find your escrow address. The factory emits a `VestingEscrowCreated` event for every escrow, with the recipient indexed, so filtering the factory's events on [Optimistic Etherscan](https://optimistic.etherscan.io/address/0xB93427b83573C8F27a08A909045c3e809610411a#events) by your wallet address shows each escrow created for you. If you're unsure, ask in Discord.
2. Open the escrow and call `unclaimed()` on the Read Contract tab to see how much has vested and not yet been claimed.
3. Connect your wallet on the Write Contract tab and call `claim()`. Only the recipient can claim. With no arguments it sends everything available to your own address; you can also pass a different `beneficiary` address, and an `amount` to claim part of it.

## Creating a vesting schedule

Escrows are created and funded by whoever is paying, usually the DAO.

1. Get the ARROW onto Optimism. If it's on mainnet, bridge it through Optimism's `L1StandardBridge` at `0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1`: call `approve` on the ArrowToken contract at `0x736609D310B5F925531B5ad895925CB0586F6241` so the bridge can spend it, then call `depositERC20To` on the bridge to send it to the funding address on Optimism. Check the [latest Optimism deployment](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/README.md) before bridging.
2. From the funding address, call `approve` on the Optimism ARROW token (`0x78b3C724A2F663D11373C4a1978689271895256f`) so the factory can spend the amount being vested.
3. Call `deploy_vesting_contract` on the factory:
   - `token`: the Optimism ARROW token address.
   - `recipient`: the contributor's wallet.
   - `amount`: the amount to vest, in the token's smallest unit (ARROW has 18 decimals).
   - `vesting_duration`: the length of the schedule in seconds.
   - `vesting_start` (optional): the UNIX timestamp vesting starts from. It defaults to the moment the escrow is created. [unixtimestamp.com](https://www.unixtimestamp.com/) converts a date.
   - `cliff_length` (optional): seconds before anything can be claimed. It defaults to 0 and can't be longer than the duration.

The factory pulls `amount` from the caller into the new escrow, and the caller becomes the escrow's admin.

## Cancelling a vesting schedule

The escrow's admin can cancel it by calling `rug_pull()`, for example after an erroneous distribution or when a contributor stops contributing. Vesting stops at that moment: the unvested remainder returns to the admin, and anything already vested stays in the escrow for the recipient to claim.
