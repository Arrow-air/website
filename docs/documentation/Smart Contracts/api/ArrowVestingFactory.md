---
sidebar_position: 3
title: ArrowVestingFactory
---

Factory contract for creating vesting wallets from base implementation.

| Functions                                                                                |
| ---------------------------------------------------------------------------------------- |
| [`constructor()`](#constuctor)                                                           |
| [`createVestingSchedule(_beneficiaryAddress, _startTimestamp, _durationSeconds)`](#vest) |

## Functions

###### constructor{#constuctor}

```sol
constructor()
```

Creates and saves a base implementation of [ArrowVestingBase](./ArrowVestingBase) to an immutable variable `vestingImplementation`.
<br />
<br />

###### createVestingSchedule{#vest}

```sol
function createVestingSchedule(
    address _beneficiaryAddress,
    uint64 _startTimestamp,
    uint64 _durationSeconds
    ) external returns (address)
```

Creates a new cloned vesting wallet from its base implementation.

The wallet will initially be empty and should have appropriate ERC20 tokens and ETH transferred to it after creation.

The amount that `_beneficiaryAddress` to receive at time `T` is `amount * (T - _startTimestamp) / _durationSeconds` for `T` is larger than `_startTimestamp`. Otherwise, no token shall be released.

- `_beneficiaryAddress`: the address to be entitled to the vesting.
- `_startTimestamp`: the time at which the wallet starts to vest.
- `_durationSeconds`: the duration (in seconds) for which the wallet vests.
