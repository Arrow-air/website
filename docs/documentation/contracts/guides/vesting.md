---
sidebar_position: 2
title: Vesting Contracts
---

# Vesting Contract

ARROW tokens are distributed to Arrow contributors as a reward for their contributions and investment in the project. These rewards are typically locked within vesting contracts, which release granted ARROW tokens over time after an initial cliff period.

These vesting contracts and tokens are distributed on the Optimism L2 network, with contributors free to bridge their tokens back to mainnet after vesting.

## How To Create New Vesting Contracts

1. Bridge the amount of ARROW tokens required from the Arrow mainnet multisig over to the Arrow Optimism multisig.

   - Check the latest [Optimism deployment](https://github.com/ethereum-optimism/optimism/tree/develop/packages/contracts/deployments/mainnet#readme) and use the `L1StandardBridge` contract at `0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1`.
   - Approve the `L1StandardBridge` to spend the required number of ARROW tokens, calling `approve` on the ArrowToken contract at `0x736609D310B5F925531B5ad895925CB0586F6241`.
   - Deposit ARROW tokens to the L2 Optimism multisig, calling `depositERC20To` on the `L1StandardBridge`.

2. Create a new vesting contract using the ArrowVestingFactory contract at `0x736609D310B5F925531B5ad895925CB0586F6241`, calling `createVestingSchedule`.

   - `beneficiaryAddress` should be set to the wallet address of the contributor to be rewarded.
   - `startTimestamp` should be set to the UNIX timestamp at which tokens should start vesting. You can use [unixtimestamp.com](https://www.unixtimestamp.com/) to calculate the UNIX timestamp representation of a specific future date.
   - `durationSeconds` should be set to the total time in seconds required for the vesting period to complete. 
   - Tokens will begin to vest when time reaches `startTimestamp`, and will vest linearly until time reaches `startTimestamp + durationSeconds`. 

3. Send ARROW tokens (or ETH or any ERC20) to the newly created vesting contract.

## How To Release Vested Tokens From A Vesting Contract

1. Find the address of the vesting contract.
2. Check current vested token allowance in the contract, calling `vestedAmount(address token, uint64 timestamp)` with the ERC20 token address and the current timestamp.
3. Release vested ARROW tokens (or any ERC20) to `beneficiaryAddress`, calling `release(address)` with the ERC20 token address.

## How To Cancel Existing Vesting Contracts

Vesting contracts have the ability to be cancelled by the Arrow multisig, in cases of erroneous token distributions or if specific contributors become inactive.

Upon cancellation, any vested tokens will be distributed to the contributor, with any remaining unvested tokens returned to the Arrow multisig.

In order to cancel an existing vesting contract:

1. Find the vesting contract to be cancelled.
2. Cancel the vesting contract, calling `cancel(address token)` from the Arrow Optimism multisig.
