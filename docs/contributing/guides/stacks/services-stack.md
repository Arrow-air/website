# Software Services Stack

:construction: In Progress! :construction:

See our [Stack Comparison](https://docs.google.com/spreadsheets/d/1pHNHEm26fOMxoBKIYfFaa7wGh-M9Thxa8qddLBMz4Xw/edit#gid=2034044715) document for rationale on our selections.

## :heavy_check_mark: Confirmed

### :black_nib: Backend Language - *Rust*

#### Overview

- [Rust](https://www.rust-lang.org/) is a systems programming language which emphasizes memory safety, performance, and productivity.
- Rust's helpful (and extremely picky) compiler is a fantastic teacher
  - Error messages are clear and thorough
  - Often suggests code corrections, even directs you to code examples!

#### Learning Resources
- [Arrow Rust Crash Course](./crash-course/rust-crash-course.md)
- [Rust in Action](https://livebook.manning.com/book/rust-in-action/welcome/v-11/) - Tim McNamara
    - First few chapters are free to read online

### :scroll: Scripting & Tools - *Python 3*

For short scripts and tools to aid development.
- Autocoding
- Integration Tests

## :exclamation: Nearing Decision

These are components of our stack that have been reduced to finalists.

### :satellite: Web Framework

Currently performing in-house benchmarks for:
- [axum](https://github.com/tokio-rs/axum)
- [actix-web](https://actix.rs/)
- [poem](https://github.com/poem-web/poem)

### :mailbox: API Specification

Currently performing in-house benchmarks for:
- [OpenAPI/Swagger](https://www.openapis.org/)
- [GraphQL](https://graphql.org/)
- [tonic](https://github.com/hyperium/tonic), a Rust implementation of [gRPC](https://grpc.io/)

### :family: Inter-Process Communication (IPC)

Currently doing in-house benchmarks for:
- [ZeroMQ](https://zeromq.org/)
- [tonic](https://github.com/hyperium/tonic), a Rust implementation of [gRPC](https://grpc.io/)

### :watch: Benchmarks and Load Testing

We're using the following framework(s) on a trial basis:
- [Codename Taurus](https://github.com/Blazemeter/taurus) + JMeter


## :construction: On Deck

### :books: Database
- Telemetry Storage
- Flight Plans
- Maintenance and Certification Records
- Customer Rewards Information
- Data Required By Civil Aviation Authorities

### :video_game: Game Engine
- Ground Control Station

### :brain: ML & Deep Learning Frameworks
- Simulation
- Optimization
