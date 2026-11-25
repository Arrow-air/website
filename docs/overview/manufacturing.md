---
mdx:
  format: mdx
sidebar_position: 5
description: How Arrow's designs get built - open designs, a network of bonded community manufacturers, and a share of every sale back to the DAO.
hide_table_of_contents: true
---

import { ManufacturingNetwork } from '@site/src/components/ArrowDiagrams';

# Manufacturing at Arrow

**Design globally, build locally.** Arrow doesn't run factories. We design in the open, online, and the building happens in the workshops of people and businesses in our community, close to the people who need the aircraft.

## Where we are today

So far that has meant prototypes, Quiver developer kits built in Texas, electronics and the Caribou airframe built in Germany, and Caribou flying since autumn 2026.

The first pieces of the manufacturing protocol already exist. There's an open [catalog](https://github.com/Arrow-air/arrow-catalog) of Arrow products, with the Quiver developer kit listed, and two approved manufacturers to start with: Javelina Propeller Laboratory in Texas for developer kits, and a workshop in Germany for parts, PCBs and EU orders. For now, most builds are still coordinated person to person.

## Where we're going

In November 2025 token holders passed [AIP-009](https://github.com/Arrow-air/dao-aips/blob/main/AIPs/AIP-009.md), the basic design for a manufacturing protocol. It gives the DAO a way to coordinate a whole network of manufacturers, guarantee quality for customers, and bring some of the value our open designs create back to Arrow to fund better designs.

<ManufacturingNetwork />

Here's how it's meant to work:

- **An open parts catalog.** Every Arrow part and product is listed with enough design detail to build it to spec and judge its quality. The DAO decides what goes in the catalog.
- **Bonded manufacturers.** To sell official Arrow products, a manufacturer posts a bond in $ARROW, a promise to ship on time and to standard. At first the DAO approves each manufacturer. Over time, anyone should be able to join by posting a bond.
- **One shop for customers.** Customers order from an Arrow web shop, paying in crypto or by card, and get the same Arrow-quality product whichever manufacturer fills the order. By default the nearest one does, or customers can pick one themselves. Later versions will also weigh stock, price, delivery time and shipping cost.
- **Value back to Arrow.** Each sale pays a commission to the DAO treasury. The rate is set per catalog item: higher for something Arrow designed from scratch, like Quiver, and lower for a simple part like a cable.
- **Protection for customers.** If a manufacturer fails to ship or ships poor quality, the DAO can slash its bond and use it to make the customer whole.

In return, manufacturers get order flow, help with the build process, and the right to sell on Arrow's behalf, without having to do their own marketing.

AIP-009 describes a concept, not a finished system, and the details will change as we build it. Early versions will be more manual than the spec: manufacturers may sell directly and pay commission back separately before the shop and the on-chain pieces exist. The core idea stays the same: an open network of builders, quality customers can count on, and a share of every sale funding what Arrow designs next.

## Why open source still works here

Arrow releases its work under copyleft licenses by default, [GPL](https://www.gnu.org/licenses/gpl-3.0.en.html) for software and [CERN-OHL-S](https://ohwr.org/cern_ohl_s_v2.txt) for hardware. Anyone can build from the designs, and nobody can take them closed. Licensing the designs as private IP was considered and set aside: it's hard to enforce for a global community without a strong legal presence. The value Arrow captures comes from the network that builds, sells and supports the aircraft.

:::tip Get Involved
Want to build Arrow hardware, or help design the manufacturing protocol? Introduce yourself on [Discord](https://discord.gg/arrow) or the [DAO Forum](https://dao.arrowair.com/) and we'll take it from there.
:::
