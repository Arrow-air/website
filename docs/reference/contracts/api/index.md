---
sidebar_position: 0
title: API Reference
description: Functions, events and deployed addresses for the ARROW token and the vesting escrows contributors were paid through.
---

Arrow's contracts are the $ARROW token and the vesting escrows that contributors were paid through between 2022 and June 2024. Arrow no longer vests contributor ARROW and every schedule has fully vested, so the escrows now only matter for claiming what's left in them. This page lists what each contract exposes. Anyone with ARROW still in an escrow can collect it with `claim()`, described below.

## Deployed addresses

| Contract | Network | Address |
|---|---|---|
| ArrowToken | Ethereum Mainnet | [`0x736609D310B5F925531B5ad895925CB0586F6241`](https://etherscan.io/token/0x736609D310B5F925531B5ad895925CB0586F6241) |
| ARROW, bridged | Optimism | [`0x78b3C724A2F663D11373C4a1978689271895256f`](https://optimistic.etherscan.io/token/0x78b3C724A2F663D11373C4a1978689271895256f) |
| Vesting escrow factory | Optimism | [`0xB93427b83573C8F27a08A909045c3e809610411a`](https://optimistic.etherscan.io/address/0xB93427b83573C8F27a08A909045c3e809610411a) |
| Vesting escrow implementation | Optimism | [`0xb61915609e6Dc7A7261b678073c53BaC5875a8B4`](https://optimistic.etherscan.io/address/0xb61915609e6Dc7A7261b678073c53BaC5875a8B4) |

ARROW on Optimism isn't a separate deployment of ArrowToken. It's Optimism's standard bridged ERC-20, created through the Optimism token factory and linked to the mainnet token, so the bridge mints and burns it as ARROW moves between networks.

Each vesting schedule was its own small escrow contract, cloned from the implementation by the factory. ARROW still sitting in an escrow counts toward [Snapshot](/docs/reference/snapshot) voting weight.

## ArrowToken

[`contracts/ArrowToken.sol`](https://github.com/Arrow-air/Arrow-Contracts/blob/main/contracts/ArrowToken.sol)

The $ARROW token is a standard ERC-20 behind an upgradeable [UUPS proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable). Everything a wallet or exchange expects (`name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`, `transfer`, `approve`, `allowance`, `transferFrom`) comes unchanged from OpenZeppelin's `ERC20Upgradeable`. Arrow adds two things on top.

| Function | Access | What it does |
|---|---|---|
| `initialize(uint256 _initialSupply, string _name, string _symbol)` | Once, at deployment | Sets the name and symbol and mints the initial supply to the deployer. |
| `mint(address _to, uint256 _amount)` | Owner only | Mints `_amount` new tokens to `_to`. |

The owner is the DAO multisig, so both minting and upgrades need its signers to approve. [AIP-010](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-010.md) fixes the supply at 100,000,000 ARROW, so `mint` stays in the code but can't be used without a separate AIP approving new supply. Because the token sits behind a proxy, its address stays the same across upgrades.

## Vesting escrow factory

[`VestingEscrowFactory.vy`](https://github.com/yearn/yearn-vesting-escrow/tree/980a3e43fc72edafc8fce11702e40ab14965ef06/contracts/VestingEscrowFactory.vy)

Arrow used Yearn's open-source vesting escrow, written in Vyper. The factory created and funded one escrow per vesting schedule, about 2,500 in all between 2022 and June 2024, and hasn't created any since.

| Member | Type | What it does |
|---|---|---|
| `deploy_vesting_contract(address token, address recipient, uint256 amount, uint256 vesting_duration, uint256 vesting_start, uint256 cliff_length)` | Function, returns the escrow address | Creates an escrow for `recipient` and funds it with `amount` of `token`, pulled from the caller, so the caller must `approve` the factory first. Tokens vest linearly over `vesting_duration` seconds from `vesting_start` (defaults to now), with nothing claimable until `cliff_length` seconds have passed (defaults to 0). The caller becomes the escrow's admin. |
| `target()` | View | The implementation every escrow is cloned from. |
| `escrows_length()`, `escrows(uint256)` | View | The number of escrows created, and each escrow's address by index. |
| `VestingEscrowCreated(funder, token, recipient, escrow, amount, vesting_start, vesting_duration, cliff_length)` | Event | Emitted for every new escrow, with `funder`, `token` and `recipient` indexed. |

## Vesting escrow

[`VestingEscrowSimple.vy`](https://github.com/yearn/yearn-vesting-escrow/tree/980a3e43fc72edafc8fce11702e40ab14965ef06/contracts/VestingEscrowSimple.vy)

Every escrow runs this contract. Because every schedule has fully vested, `unclaimed()` now shows an escrow's whole remaining balance and `claim()` collects it.

| Function | Access | What it does |
|---|---|---|
| `recipient()`, `token()`, `start_time()`, `end_time()`, `cliff_length()` | View | The schedule's recipient, token and timing. |
| `total_locked()`, `total_claimed()` | View | The escrow's original amount, and how much has been claimed so far. |
| `unclaimed()` | View | Vested tokens the recipient can claim right now. |
| `locked()` | View | Tokens that haven't vested yet. |
| `claim(address beneficiary, uint256 amount)` | Recipient only | Sends vested tokens to `beneficiary`. Both arguments are optional: by default it claims everything available to the recipient's own address. |
| `rug_pull()` | Admin only | Cancels the schedule. Vesting stops, the unvested remainder returns to the admin, and anything already vested stays claimable by the recipient. |
| `commit_transfer_ownership(address)`, `apply_transfer_ownership()`, `renounce_ownership()` | Admin, then new admin | Hands the admin role to another address in two steps, or gives it up entirely. |

## Other contracts in the repository

The [Arrow-Contracts repository](https://github.com/Arrow-air/Arrow-Contracts) also holds `ArrowVestingFactory` and `ArrowVestingBase`, an earlier Solidity vesting design built on OpenZeppelin's `VestingWallet`. Contributor vesting ran on the Yearn escrows above, so those two contracts aren't documented here.

Contributor pay has also been streamed in USDC on Ethereum Mainnet through [LlamaPay](https://llamapay.io), a third-party payment streaming protocol. LlamaPay isn't an Arrow contract, so it isn't covered here.

## Contributing

If you spot something here that doesn't match the contracts, the code is the source of truth, and a PR to the [Arrow-Contracts repository](https://github.com/Arrow-air/Arrow-Contracts) or to these docs is welcome.
