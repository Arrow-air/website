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

#### Crash Course

These are projects to get a basic grasp of Rust. You're meant to struggle a bit - don't worry! The compiler will help :)

Level 0:
1) Compile the [Hello, Cargo!](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html) project
2) [Add a src/lib.rs file and add the library to the cargo.toml](https://doc.rust-lang.org/cargo/reference/cargo-targets.html?highlight=library#library)
3) Add a function to `lib.rs` which takes an unsigned integer as an argument and returns the sum.
    - `pub fn add_one(a: u32) -> u32`
4) Add a [unit test](https://doc.rust-lang.org/rust-by-example/testing/unit_testing.html) for `add_one`
    - Use [`assert_eq!`](https://doc.rust-lang.org/std/macro.assert_eq.html) to compare the result with the expected result
    ```rust
    let x: u32 = 5;
    let result = add_one(x);
    assert_eq!(result, 6)
    ```
    - Unit tests validate the internal workings of a module
5) Add an [integration test](https://doc.rust-lang.org/rust-by-example/testing/integration_testing.html) to `tests/integration_test.rs` which also tests `add_one`
    - This is simply to show the difference in compiling unit and integration tests
    - Integration tests target the interfaces of a module
6) Modify `add_one` to instead update `a` in place, with no return value.
    ```rust
    let mut x: u32 = 5;
    add_one(x); // no return value!
    assert_eq!(x, 6)
    ```
    - Hint: https://www.educative.io/answers/how-to-use-references-in-rust

Level 1:
1) Create a single function which returns the largest element of a [vector](https://doc.rust-lang.org/std/vec/struct.Vec.html) of type `u32`
    - `fn largest(xs: &[u32]) -> u32`
    - Why should `largest` take a pointer to the list (`&[u32]`) instead of the list (`[u32]`)?
        - Consider the size of a pointer versus the size of the list
        - `&[T]` is also called a `slice`
            - Good [StackOverflow explanation](https://stackoverflow.com/questions/61151041/what-is-the-difference-between-a-slice-and-reference-in-rust)
2) Modify the function to return the largest element of a [vector of *any type*](https://doc.rust-lang.org/book/ch10-01-syntax.html)
    - `fn largest<T>(xs: &[T]) -> T`
3) Add a [data structure](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html) called `Ticket`.
    - `Ticket` shouldhave  two fields:
        - `u32 id`
        - `DateTime<UTC> timestamp`
    - We need to import an external crate: `chrono`
        - [Add `chrono` to your `cargo.toml` under `[dependencies]`](https://crates.io/crates/chrono) (see "Usage")
        - [Importing DateTime and UTC to your file](https://docs.rs/chrono/0.4.0/chrono/struct.DateTime.html#example) 
4) Create a unit test `ut_largest_ticket` which does the following:
    - Creates a vector `tickets` with the following two `Ticket` elements:
        - `Ticket { id: 1, timestamp: Utc::now() }`
        - `Ticket { id: 2, timestamp: Utc::now() + Duration::minutes(30) }`
    - Pass this `Ticket` vector to the `largest` function.
    - [Assert](https://doc.rust-lang.org/std/macro.assert.html#examples) that the ID of the returned element is `2`. 
    - Should fail to compile!
5) The compiler doesn't know how to compare two `Ticket` objects - yet.
    - [Implement the `PartialOrd`, `Ord`, and `PartialEq` traits for the `Ticket` object.](https://doc.rust-lang.org/std/cmp/trait.Ord.html#how-can-i-implement-ord)
    - We'll say that the "largest" ticket should be the one with the later timestamp.
    - Since we've implemented `PartialEq`, we can let the Rust compiler implement `Eq` for us.
        - Add `#derive[(Eq)]` above `Ticket` to tell Rust to implement this trait for us.
    - [Traits define behaviors for types](https://doc.rust-lang.org/book/ch10-02-traits.html).
6) Run the unit tests again.
    - Should pass!

Level 2:
- Coming Soon

#### Learning Resources
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

### :family: Interprocess Communication (IPC)

Currently doing in-house benchmarks for:
- [ZeroMQ](https://zeromq.org/)
- [tonic](https://github.com/hyperium/tonic), a Rust implementation of [gRPC](https://grpc.io/)

### :watch: Benchmarks and Load Testing

We're using the following framework(s) on a trial basis:
- [Codename Taurus](https://gettaurus.org/) + JMeter


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