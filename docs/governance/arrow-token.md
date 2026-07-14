---
sidebar_position: 3
description: The $ARROW token — supply, utilities, treasury deployment, and roadmap under AIP-010.
---

# The $ARROW Token

$ARROW is Arrow DAO's governance and utility token. Its framework is defined by [AIP-010 (Tokenomics V1)](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-010.md).

:::warning[$ARROW is not an investment product]
Holders have no entitlement to profit, dividends, or distributions — the token's value derives from the utility of governing and participating in the Arrow network.
:::

## Token parameters

| Parameter | Value |
|-----------|-------|
| Token name | Arrow Air |
| Ticker | $ARROW |
| Total supply | 100,000,000 — fixed, no minting |
| Token standard | ERC-20 upgradeable proxy (EIP-1967) |
| Ethereum Mainnet | [`0x736609D310B5F925531B5ad895925CB0586F6241`](https://etherscan.io/token/0x736609D310B5F925531B5ad895925CB0586F6241) |
| Optimism | [`0x78b3C724A2F663D11373C4a1978689271895256f`](https://optimistic.etherscan.io/token/0x78b3C724A2F663D11373C4a1978689271895256f) |
| Governance | [Snapshot (arrowair.eth)](https://snapshot.org/#/s:arrowair.eth) |

Supply is fixed at 100,000,000 $ARROW. New tokens cannot be minted under the current framework; any future change to supply would require a standalone AIP with explicit community approval. All token deployment draws from the existing DAO treasury.

## What $ARROW does

The token has three active utilities:

### 1. Governance

1 $ARROW = 1 vote on [Snapshot](https://snapshot.org/#/s:arrowair.eth). Major protocol decisions, treasury allocations, and project approvals are decided by token-weighted vote. Vested tokens count toward voting weight. See [Voting History](./good-to-know/dao-voting) for how voting works in practice.

### 2. Manufacturing bonds

Under [AIP-009](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-009.md), community manufacturers post $ARROW as a quality-guarantee bond to fulfill orders for Arrow-designed hardware. Bonds lock for 28 days per shipped unit while the customer inspects the product. If the DAO upholds a customer dispute, the bond can be slashed: slashed tokens first compensate the customer, and any excess is burned — permanently reducing total supply. The DAO never keeps slashed tokens as revenue. Each sale also pays a commission to the DAO treasury. See [Manufacturing](../overview/manufacturing) for the full picture.

### 3. Contributor compensation

Contributors can take part of their compensation in $ARROW, and token-heavy blends are incentivized with a 1.5× multiplier on the token portion ([AIP-004](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-004.md)). Contributor tokens are issued through on-chain vesting contracts on Optimism.

## Annual treasury deployment cap

Roughly 76% of $ARROW supply sits in the DAO treasury. AIP-010 governs how it leaves: each year the DAO must approve a deployment cap by governance vote, specifying how much $ARROW may be deployed and for what. Deployment is never automatic, and undeployed tokens stay in the treasury with no rollover.

**Year 1 (2026) cap: 5,000,000 $ARROW** (~6.5% of the treasury balance):

| Bucket | $ARROW | Purpose |
|--------|-------:|---------|
| Grants program | 1,500,000 | Contributor grants and bounties |
| Manufacturing rewards | 500,000 | Incentives for AIP-009 bonded manufacturers |
| Project funding | 3,000,000 | Long-term engineering projects — deployed directly or converted to USDC |
| Operator incentives | 0 | Activates in Phase 2 with operator staking |

The project funding bucket authorizes the *purpose*, not the transactions: every conversion of treasury $ARROW to USDC requires its own governance vote covering amount, venue, counterparty, and pricing. Treasury deployment exists to fund real protocol actors — contributors, manufacturers, and projects — not to support speculation.

## Liquidity

An $ARROW-USDC pool exists on [Uniswap V3 (Ethereum Mainnet)](https://etherscan.io/address/0x84c4d2339c03aE3F7D5B7e63e3477b1dCA1610Ec). In the current framework, the DAO's authorized market activity is limited to individually voted sales from the project funding bucket, sized and paced to available liquidity. A DAO-owned liquidity pool is not authorized by AIP-010 and would require its own governance action and legal review.

## Roadmap

AIP-010 sketches a non-binding direction for future phases — each mechanism requires its own future AIP:

- **Phase 2 (2027+):** vertiport and aircraft operator staking as the cargo network launches. Operators post $ARROW stake to register in the network, with fee discounts scaled to stake and geographically weighted incentives designed to favor a shared network of independent operators over capital-dominant hubs.
- **Phase 3 (2028+):** per-flight network rewards for early passengers and cargo customers, a mature staking ecosystem, and on-chain governance.

## Key addresses

| Entity | Network | Address |
|--------|---------|---------|
| $ARROW token | Ethereum Mainnet | `0x736609D310B5F925531B5ad895925CB0586F6241` |
| $ARROW token | Optimism | `0x78b3C724A2F663D11373C4a1978689271895256f` |
| DAO Treasury (Gnosis Safe) | Ethereum Mainnet | `0x03b5dc2ce78a7bee9f66dd619b291595a2e166bb` |
| DAO multisig | Optimism | `0xaDc17e5f0e9F755C717B2beE43B590260034b852` |
| Vesting factory (Snapshot voting weight) | Optimism | `0xB93427b83573C8F27a08A909045c3e809610411a` |
| Uniswap V3 $ARROW-USDC pool | Ethereum Mainnet | `0x84c4d2339c03aE3F7D5B7e63e3477b1dCA1610Ec` |
