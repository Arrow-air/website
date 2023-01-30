---
sidebar_position: 1
---

# Services Introduction

The software backend of Advanced Aerial Mobility (AAM).

Fleet routing, optimization, vertiport scheduling, flight booking, automated maintenance scheduling, regulatory compliance, and more.
## :books: Document Types

Document | Abbr. | Description
---- | ---- | ---
Concept of Operations | CONOPS | Goals and motivation for the creation of a module.<br />Key components, risk factors, modes of operation, and impact assessment.
Software Design Document | SDD | Description of module implementation.<br />Sequence diagrams.
Interface Control Document | ICD | The source of truth of a module's interfaces.
Systems Engineering Management Plan | SEMP | Document and code lifecycle management.

## :telescope: High-Level Documentation

- Concept of Operations ([:sparkles: stable, [:hammer: develop](https://github.com/Arrow-air/se-services/blob/develop/docs/conops.md))
- SE Management Plan (:sparkles: stable, [:hammer: develop](https://github.com/Arrow-air/se-services/blob/develop/docs/semp.md))
- Interface Control Document (:sparkles: stable, [:hammer: develop](https://github.com/Arrow-air/se-services/blob/develop/docs/icd.md))


## :ant: Module-Level Documentation

All module repositories have a `docs` folder.

### [`svc-cargo`](https://github.com/Arrow-air/svc-cargo)

> Server-side request handler for cargo flights.
> Handle customer cargo flight requests and obtain itinerary information.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-cargo/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-cargo/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-cargo/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-cargo/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-cargo/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-cargo/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-cargo/develop/svc_cargo/index.html))

### [`svc-scheduler`](https://github.com/Arrow-air/svc-scheduler)

> Create, modify, and delete flights considering vertiport and aircraft schedules, optimize fleet routing.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-scheduler/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-scheduler/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-scheduler/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-scheduler/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-scheduler/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-scheduler/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-scheduler/develop/svc_scheduler/index.html))

### [`svc-storage`](https://github.com/Arrow-air/svc-storage)

> Retrieve and store data to various databases for other microservices.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-storage/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-storage/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-storage/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-storage/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-storage/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-storage/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-storage/develop/svc_storage/index.html))

### [`svc-pricing`](https://github.com/Arrow-air/svc-pricing)

> Calculates the cost of an itinerary and the price presented to customers.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-pricing/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-pricing/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-pricing/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-pricing/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-pricing/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-pricing/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-pricing/develop/svc_pricing/index.html))

### [`svc-assets`](https://github.com/Arrow-air/svc-assets)

> Registration and management of network assets.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-assets/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-assets/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-assets/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-assets/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-assets/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-assets/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-assets/develop/svc_assets/index.html))

### [`svc-telemetry`](https://github.com/Arrow-air/svc-telemetry)

> Receive and rebroadcast vehicle and vertiport telemetry.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-telemetry/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-telemetry/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-telemetry/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-telemetry/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-telemetry/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-telemetry/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-telemetry/develop/svc_telemetry/index.html))

### [`svc-compliance`](https://github.com/Arrow-air/svc-compliance)

> Receive and rebroadcast vehicle and vertiport compliance.

- Concept of Operations ([:sparkles: stable](https://github.com/Arrow-air/svc-compliance/blob/main/docs/conops.md), [:hammer: develop](https://github.com/Arrow-air/svc-compliance/blob/develop/docs/conops.md))
- Software Design Document ([:sparkles: stable](https://github.com/Arrow-air/svc-compliance/blob/main/docs/sdd.md), [:hammer: develop](https://github.com/Arrow-air/svc-compliance/blob/develop/docs/sdd.md))
- Interface Control Document ([:sparkles: stable](https://github.com/Arrow-air/svc-compliance/blob/main/docs/icd.md), [:hammer: develop](https://github.com/Arrow-air/svc-compliance/blob/develop/docs/icd.md))
- Rust Docs (:sparkles: stable, [:hammer: develop](https://www.arrowair.com/rust-docs/svc-compliance/develop/svc_compliance/index.html))

## :scroll: Relevant Supplementary Materials

Item | Description
--- | ---
:one: [R1 Kickoff Slides](https://docs.google.com/presentation/d/1w67jmXz8PCbrKqXVyfm7mrglstXGrd8lBW1hvwnFs4M/edit#slide=id.p1) | Overview of planned R1 work and demos
:two: [R2 Kickoff Slides](https://docs.google.com/presentation/d/1qa4xyMi2J_i_KCw--sTxRThvMo6QpeBPecASg27abu0/edit#slide=id.g1201bb7c418_2_33) | Overview of planned R2 work and demos

## :busts_in_silhouette: Contributors

See the [Arrow-air/services](https://github.com/orgs/Arrow-air/teams) team.

## :wave: Want to Contribute?

See our [Getting Started Guide](https://www.arrowair.com/docs/contributing/intro), and reach out to us on the [Arrow Discord](https://discord.com/invite/arrow)!
