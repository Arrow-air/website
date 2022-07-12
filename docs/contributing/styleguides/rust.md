# Rust Style Guide

:zap: View the sidebar (right) for the rapid navigation.

## :guardsman: Formatting, Linting and Static Analysis

*TL;DR Use `rustfmt`, `cargo clippy` and copy
[`.cargo/config.toml`](https://github.com/Arrow-air/svc-template-rust/.cargo/config.toml)*

Rust does not have an official style guide. It relies on the `rustfmt` tool.

Run the following before pushing code:
- `rustfmt`: Format code to Rust's style guide
- `cargo check`: Check a local package and all of its dependencies for errors
- `cargo test`: Run unit and integration tests
- `cargo clippy`: A collection of lints to catch common mistakes and improve your Rust code. [Source Code](https://github.com/rust-lang/rust-clippy)

:exclamation: `rustfmt`, `clippy`, `cargo check`, and `cargo test` will be run in CI (GitHub Workflows). Errors must be fixed prior to merging a pull request.

:exclamation: [cargo fuzz](https://rust-fuzz.github.io/book/introduction.html) and [rudra](https://github.com/sslab-gatech/Rudra) may also be introduced at a later date.

### Additional Linters

`rustc` has a series of *lints*, or checks that run during compilation.
- Lints are allowed-by-default, warn-by-default, or deny-by-default (error)
- [Complete list of Rust lints](https://doc.rust-lang.org/rustc/lints/listing/allowed-by-default.html)

We configure our builds for stricter linting, including missing docs and unsafe
code.
- See a [template
`.cargo/config.toml`](https://github.com/Arrow-air/svc-template-rust/.cargo/config.toml)
to see which flags we manually set.

:exclamation: These are warnings (instead of errors) to ease development, **however**:
- These warnings will be treated as **errors** in the continuous
integration (CI) pipeline.
- They must be resolved before a Pull Request can be merged.

## :speech_balloon: Docstrings

`cargo doc` is used to build documentation.

"Docstrings" are comments that explain the purpose of a function or structure.

When documenting the "next" item, docstrings start with `///`. Markdown syntax is supported!

*Example:*
```rust
/// Returns a person with the name given them
///
/// # Arguments
///
/// * `name` - A string slice that holds the name of the person
///
/// # Examples
///
/// ```
/// // You can have rust code between fences inside the comments
/// // If you pass --test to `rustdoc`, it will even test it for you!
/// use doc::Person;
/// let person = Person::new("name");
/// ```
pub fn new(name: &str) -> Person {
    Person {
        name: name.to_string(),
    }
}
```

When documenting an enclosing item, `//!` is used.
- This includes the "crate comment" at the top of the source file.

*Example:*
```rust
//! The Foo module does X
//! This is the "crate documentation"

mod foo {
    //! This is documentation for the `foo` module.
    //!
    //! # Examples

    // ...
}
```

Read more about Rust docs [here](https://doc.rust-lang.org/rust-by-example/meta/doc.html).

## :page_with_curl: License Boilerplate

Every file should start with a license boilerplate.

The license may vary from repository to repository.

Check with the `#legal` team if unclear which license to use.