---
sidebar_position: 2
title: ArrowVestingBase
---

Base implementation of vesting contract that will be cloned into individual vesting wallets pointing at specific beneficiary addresses.

| Functions                                                                           |
| ----------------------------------------------------------------------------------- |
| [`constructor()`](#constuctor)                                                      |
| [`initialize(_beneficiaryAddress, _startTimestamp, _durationSeconds)`](#initialize) |

## Functions

###### constructor {#constuctor}

```sol
constructor() initializer
```

Creates an instance of the contract to be used as a "prototype" for [`ArrowVestingFactory`](./ArrowVestingFactory) to make clones.
<br />
<br />

###### initialize{#initialize}

```sol
function initialize(address _beneficiaryAddress, uint64 _startTimestamp, uint64 _durationSeconds) public initializer
```

Acts as a constructor by the factory contract to initialize and deploy the clone contract.

- `_beneficiaryAddress`: the address to be entitled to the vesting.
- `_startTimestamp`: the time at which the wallet starts to vest.
- `_durationSeconds`: the duration (in seconds) for which the wallet vests.
