---
sidebar_position: 1
title: ArrowToken
---

`ArrowToken` inherits the [ERC20](https://docs.openzeppelin.com/contracts/2.x/api/token/erc20) protocal, which allows the contract to create and manage fungible tokens.

The token contract is [upgradeable](https://docs.openzeppelin.com/contracts/4.x/upgradeable) under [UUPS proxies](https://docs.openzeppelin.com/contracts/4.x/api/proxy#transparent-vs-uups).

| Functions                                        |
| ------------------------------------------------ |
| [`initialize(_initialSupply)`](#init)            |
| [`issueNewTokens(_to, _amount)`](#issueNewToken) |

## Functions

###### initialize{#init}

```sol
function initialize(uint256 _initialSupply) public initializer
```

Acts as a constructor under UUPS proxies. `initializer` is a modifier that makes sure the contract is only initiated once.

- `_initialSupply`: the amount of tokens to be issued upon contract creation.

###### issueNewTokens{#issueNewToken}

```sol
function issueNewTokens(address _to, uint256 _amount) public onlyOwner
```

Mint and send new tokens.
Only the owner of the contract can call this function. However, the ownership can be transferred by the current owner by calling `transferOwnership(address newOwner)`.

- `_to`: the recipient's address.
- `_amount`: number of tokens.
