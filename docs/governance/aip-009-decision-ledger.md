---
sidebar_position: 10
description: AIP-009 Manufacturing Bonding Working Session — decision ledger, August 2026.
---

# AIP-009 Decision Ledger

**Working Session:** Manufacturer Bonding and Approval
**Date:** 4 August 2026
**Chair:** Laurent Ketterle (laurentketterle-hub)
**Status:** Decision Ledger Published

---

## 1. Recap — Where AIP-009 Stands

AIP-009 (Manufacturing Protocol Basic Design) passed on 15 November 2025. It defines an on-chain shop with bonded manufacturers, collateral that can be slashed, and open-source licensing for Arrow-designed products.

**Commerce half — done:**
- The catalog, store app, and settlement contract merged on 1 August 2026
- The settlement contract holds no bond logic — this is deliberate pending the bonding half

**Bonding half — not started:**
- Both manufacturers (Julius and Pan Robotics) are marked trusted-mvp placeholders
- The settlement contract needs bond terms before Julius can proceed
- 500,000 ARROW is allocated for manufacturing rewards (AIP-010 Year 1 cap)

**This session:** Chair the bonding conversation, minute decisions, publish the ledger.

---

## 2. Agenda and Participants

### Required Participants
| Name | Role | Present |
|------|------|---------|
| Julius (Europe manufacturer) | Manufacturer | Yes |
| Pan Robotics (West Africa) | Manufacturer | Yes |
| Erick (delegate) | ARROW delegator | Yes |
| GBC Representative | Grants and Bounties | Yes |
| Arrow Compass Lead | Project oversight | Yes |

### Seed Agenda
1. Is 120,000 ARROW still the bond size for Julius?
2. The bond yield percentage (open since forum #152)
3. Erick offer to delegate ARROW for a share of the yield
4. Where bond logic lives (settlement contract has none)
5. The per-unit bond for a Quiver (AIP-010 5000 is illustrative)
6. How a manufacturer applies and gets approved
7. The dispute and slashing procedure
8. The 500,000 ARROW manufacturing rewards pool
9. West Africa node designation (blocked on MoU as of 1 August)

---

## 3. Decisions

### Item 1 — Julius Bond Size
**Decision:** 120,000 ARROW confirmed as the initial bond size for Julius.
**Rationale:** Matches the forum #152 baseline. Julius confirmed his production capacity supports this level.
**Owner:** Julius — proceed to bond posting.
**Status:** Decided

### Item 2 — Bond Yield Percentage
**Decision:** Set at 4 percent APR, paid quarterly from the 500,000 ARROW manufacturing rewards pool.
**Rationale:** Forum #152 discussion converged around 3-5 percent. 4 percent balances manufacturer incentive with pool sustainability.
**Owner:** GBC — draft the yield distribution schedule.
**Status:** Decided

### Item 3 — Erick Delegation Offer
**Decision:** Accepted in principle. Erick delegates up to 50,000 ARROW toward manufacturer bonds. Yield split: 70 percent to Erick, 30 percent to manufacturer.
**Rationale:** Delegation lowers the barrier for new manufacturers without diluting the bond requirement. Split incentivises both parties.
**Owner:** Erick and Julius — formalise delegation terms before bond posting.
**Status:** Decided

### Item 4 — Bond Logic Location
**Decision:** Bond logic will live in a new BondManager contract, separate from the settlement contract.
**Rationale:** Separation of concerns. Settlement handles order fulfilment; BondManager handles locking, yield, slashing, and release. This avoids coupling and makes slashing auditable independently.
**Owner:** Arrow Compass engineering — spec the BondManager interface.
**Review date:** 18 August 2026
**Status:** Owner assigned

### Item 5 — Per-Unit Quiver Bond
**Decision:** Set at 2,500 ARROW per Quiver unit, not the illustrative 5,000.
**Rationale:** AIP-010 5,000 was explicitly labelled illustrative. 2,500 provides meaningful skin-in-the-game while keeping the bond accessible for smaller batches.
**Owner:** GBC — update the manufacturer guidelines.
**Status:** Decided

### Item 6 — Manufacturer Application and Approval
**Decision:** Two-step process: (1) Manufacturer submits an application via the DAO forum with production capacity evidence and bond readiness. (2) GBC reviews within 14 days and recommends to Snapshot for a 5-day vote.
**Owner:** GBC — publish the application template.
**Review date:** 18 August 2026
**Status:** Owner assigned

### Item 7 — Dispute and Slashing Procedure
**Decision:** Three-stage escalation: (1) Customer files a dispute with evidence within the 28-day inspection window. (2) GBC mediates — if unresolved, escalates to a 7-day Snapshot vote. (3) If slashing is upheld: customer compensated first, excess burned. The DAO never keeps slashed tokens.
**Owner:** GBC — draft the full dispute procedure document.
**Review date:** 25 August 2026
**Status:** Owner assigned

### Item 8 — 500,000 ARROW Manufacturing Rewards Pool
**Decision:** Pool allocation confirmed: 60 percent for bond yields, 30 percent for manufacturer onboarding incentives, 10 percent reserved for dispute compensation buffer. Quarterly review by GBC.
**Rationale:** Yield payments are the primary ongoing cost. Onboarding incentives attract new manufacturers. The buffer ensures dispute compensation does not interrupt yields.
**Owner:** GBC — set up quarterly review schedule.
**Status:** Decided

### Item 9 — West Africa Node Designation
**Decision:** Blocked pending MoU. Pan Robotics cannot be approved as a bonded manufacturer until the West Africa node Memorandum of Understanding is signed.
**Rationale:** The MoU establishes legal and operational framework for Arrow presence in the region. Without it, bond enforcement and dispute resolution have no jurisdictional basis.
**Owner:** Arrow Compass Lead — progress the MoU.
**Review date:** 1 September 2026
**Status:** Blocked (external)

---

## 4. Follow-up Bounties

| # | Title | Description |
|---|-------|-------------|
| 1 | BondManager contract specification | Spec the BondManager interface: lock, yield, slash, release functions |
| 2 | Manufacturer application template | Publish the DAO forum template for manufacturer applications |
| 3 | Dispute procedure document | Full three-stage escalation procedure with evidence requirements and timelines |
| 4 | Yield distribution smart contract | Implement the quarterly yield distribution from the rewards pool |
| 5 | Bond delegation smart contract | Smart contract for delegated bonding with configurable yield splits |
| 6 | Quiver per-unit bond automation | Update the store app to calculate and display per-unit bond requirements |
| 7 | Manufacturing onboarding guide | Step-by-step guide for new manufacturers: application, bond, approval, first order |

---

## 5. Sign-off

This ledger captures the decisions, owners, and next steps from the AIP-009 manufacturing bonding working session held on 4 August 2026. All participants have reviewed and confirmed their action items.

- **Chair:** Laurent Ketterle (laurentketterle-hub)
- **Published:** 4 August 2026
- **Next review:** 18 August 2026 (BondManager spec and application template)

---

*This document fulfills the AIP-009 Accelerator bounty (#216). It is a living record — owners may update their items as progress is made.*
