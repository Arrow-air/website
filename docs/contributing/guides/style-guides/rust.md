# Rust Style Guide

:zap: View the sidebar (right) for the rapid navigation.

## Uniform Formatting and Linting

To ensure high quality code, we have imposed strict linting, testing, and formatting requirements.

For this goal, the following files and directories must be uniform across all Rust repositories:
- `.editorconfig`: Specifies file formatting rules that must be followed
- `.github/workflows/rust_ci.yml`: Specifies GitHub Workflow actions that must pass prior to merge
- `.github/workflows/editorconfig_check.yml`: Ensures no file formatting violations prior to merge
- `.cargo/config.toml`: Specifies extra compiler checks for stricter linting
- `.cargo-husky/hooks/`: Scripts that must succeed before `git commit` is allowed to execute
- `.gitignore`: One of two `.gitignore` files, one shared by Rust libraries and one shared by Rust services
- Code coverage configuration (coming soon)

:exclamation: Don't worry! We create and update these automatically through [Terraform](https://www.terraform.io/).

These files should only be edited in the [`tf-github`](https://github.com/Arrow-air/tf-github/tree/main/src/templates/rust-all/) repository. Changes will be applied to all Rust repositories in the Arrow organization.

Example:
- Add a newline to `tf-github/templates/rust-all/.editorconfig`.
- Make a pull request, get approvals, merge to `main`
- A new commit is pushed to the default branch of each Rust repository controlled by Terraform.
  - Each repository now has an updated `.editorconfig` file.

## :guardsman: Formatting, Linting and Static Analysis

Rust does not have an official style guide. It relies on the `rustfmt` tool.

We use [husky](https://github.com/rhysd/cargo-husky) for pre-commit hooks.

Husky will automatically run the following when you attempt to commit changes:
- `rustfmt`: Format code to Rust's style guide
- `cargo check`: Check a local package and all of its dependencies for errors
- `cargo test`: Run unit and integration tests
- `cargo clippy -- -D warnings`: A collection of lints to catch common mistakes
  and improve your Rust code. [Source
  Code](https://github.com/rust-lang/rust-clippy)
- `taplo format --check`: Format TOML files to Arrow's style guide
- `cspell --words-only --unique "**/**" -c .cspell.config.yaml`: Spell check all files in the repository
- `ghcr.io/tcort/markdown-link-check`: Check for all broken links in the repository
- `hub.docker.com/r/mstruebing/editorconfig-checker`- Check for all editorconfig violations in the repository

Any errors (including warnings) must be resolved before committing code.

:exclamation: These same checks will be run in CI, and must pass before the code
can be merged.

:exclamation: [cargo fuzz](https://rust-fuzz.github.io/book/introduction.html) and [rudra](https://github.com/sslab-gatech/Rudra) may also be introduced at a later date.

### Additional Linters

`rustc` has a series of *lints*, or checks that run during compilation.
- Lints are allowed-by-default, warn-by-default, or deny-by-default (error)
- [Complete list of Rust lints](https://doc.rust-lang.org/rustc/lints/listing/allowed-by-default.html)

We configure our builds for stricter linting, including missing docs and unsafe
code.
- See a [template
`.cargo/config.toml`](https://github.com/Arrow-air/svc-template-rust/blob/develop/.cargo/config.toml)
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

## :page_with_curl: License Notice

Every file should start with a license notice.

The license may vary from repository to repository.

Check with the `#legal` team if unclear which license to use.
