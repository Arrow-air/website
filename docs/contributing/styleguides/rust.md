# Rust Style Guide

:zap: View the sidebar (right) for the rapid navigation.

## :guardsman: Formatting, Linting and Static Analysis
Rust does not have an official style guide. It relies on the `rustfmt` tool.

Run the following before pushing code:
- `rustfmt`: Format code to Rust's style guide
- `cargo check`: Check a local package and all of its dependencies for errors
- `cargo test`: Run unit and integration tests
- `cargo clippy`: A collection of lints to catch common mistakes and improve your Rust code. [Source Code](https://github.com/rust-lang/rust-clippy)

:exclamation: `rustfmt`, `clippy`, `cargo check`, and `cargo test` will be run in CI (GitHub Workflows). Errors must be fixed prior to merging a pull request.

:exclamation: [cargo fuzz](https://rust-fuzz.github.io/book/introduction.html) and [rudra](https://github.com/sslab-gatech/Rudra) may also be introduced at a later date.

## :page_with_curl: License Boilerplate

Every file should start with a license boilerplate.

The license may vary from repository to repository.

Check with the `#legal` team if unclear which license to use.