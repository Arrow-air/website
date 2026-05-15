---
draft: true
---

# Tables

---

## Basic table

| Name | Role | Location |
|------|------|----------|
| Alice | Engineer | Remote |
| Bob | Designer | New York |
| Carol | Product | London |

---

## Left, center, and right alignment

| Left | Center | Right |
|:-----|:------:|------:|
| Apple | 1 | $1.00 |
| Banana | 12 | $9.99 |
| Cantaloupe | 128 | $24.50 |

---

## Long content

| Component | Description | Status |
|-----------|-------------|--------|
| Flight Controller | Manages stabilization, motor mixing, and autonomous flight modes for Project Quiver | Active |
| Ground Control Station | Web-based telemetry dashboard for monitoring live flight data and mission planning | In Progress |
| Data Pipeline | Ingests ADS-B transponder data from receiver network and normalizes into Arrow's schema | Active |
| Onboarding Portal | Self-serve contributor registration, CLA signing, and dev-kit loan application system | Planned |

---

## Many columns

| ID | Name | Type | Status | Priority | Owner | Updated |
|----|------|------|--------|----------|-------|---------|
| 001 | Quiver v2 | Hardware | Active | High | Alice | Mar 2026 |
| 002 | Flight Sim | Software | Active | Medium | Bob | Feb 2026 |
| 003 | Docs Rewrite | Content | Done | Low | Carol | Jan 2026 |
| 004 | API v3 | Software | Planned | High | Dave | — |

---

## With inline code

| Method | Endpoint | Returns |
|--------|----------|---------|
| `GET` | `/api/flights` | Array of flight objects |
| `POST` | `/api/flights` | Created flight object |
| `GET` | `/api/flights/:id` | Single flight object |
| `DELETE` | `/api/flights/:id` | `204 No Content` |

---

## With links and bold

| Resource | Description |
|----------|-------------|
| [DAO Forum](https://dao.arrowair.com) | Governance, bounties, and proposals |
| [GitHub](https://github.com/Arrow-air) | Source code and hardware designs |
| [Snapshot](https://snapshot.org/#/s:arrowair.eth) | On-chain voting |
| **Discord** | Day-to-day community chat |

---

## Two columns

| Term | Definition |
|------|------------|
| AIP | Arrow Improvement Proposal — the formal process for proposing changes to Arrow DAO |
| Bounty | A funded task posted on the DAO Forum with a defined scope and token reward |
| Quiver | Arrow's open source quadcopter platform, designed for autonomous aerial mobility |
| CLA | Contributor License Agreement — required before merging code into Arrow repositories |

---

## Single column

| Supported Platforms |
|---------------------|
| Linux (x86_64) |
| macOS (Apple Silicon) |
| macOS (Intel) |
| Windows (WSL2) |
