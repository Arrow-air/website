# Arrow Rust Crash Course

Through these projects you will learn what you need to contribute to the Arrow Rust codebase.

Attempt these steps without looking them up first! You'll only learn by trying them yourself.

You're meant to struggle a bit - don't worry! The compiler will help :)

When you're ready for help, many of the instructions link to helpful resources or Rust docs.

## Level 0 - Libraries, Tests, Refs

1) Compile the [Hello, Cargo!](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html) project

2) [Create src/lib.rs and add it as a library to Cargo.toml](https://doc.rust-lang.org/cargo/reference/cargo-targets.html?highlight=library#configuring-a-target)

<details><summary>Solution</summary>
<p>

```toml
# in Cargo.toml
[lib]
name = "adder"
path = "src/lib.rs"
test = true
```
</p>
</details>

3) Add a function to `src/lib.rs` which takes an unsigned integer as an argument and [returns](https://doc.rust-lang.org/rust-by-example/fn.html) the sum.

```rust
fn add_one(x: u32) -> u32 {
    // what are two ways to return a value from this function?
    // ...
}
```

<details><summary>Solution</summary>
<p>

```rust
fn add_one(x: u32) -> u32 {
    x + 1
    
    // Could also return with:
    // return x + 1; 
}
```
    
Notice that there is no semicolon `;` after `x+1`. `return` is not needed when the returned value is the last expression in the function.

Try adding a semicolon and see the compiler explanation!
    
```bash
$ cargo build
error[E0308]: mismatched types
 --> src/main.rs:1:23
  |
1 | fn add_one(x: u32) -> u32 {
  |    -------            ^^^ expected `u32`, found `()`
  |    |
  |    implicitly returns `()` as its body has no tail or `return` expression
2 |     x + 1;
  |          - help: remove this semicolon
```
    
</p>
</details>

4) Add a [unit test](https://doc.rust-lang.org/rust-by-example/testing/unit_testing.html) to the bottom of `lib.rs` for `add_one`
- Unit tests validate the internal workings of a module
- Use [`assert_eq!`](https://doc.rust-lang.org/std/macro.assert_eq.html) to compare the result with the expected result

<details><summary>Solution</summary>
<p>

```rust
// Bottom of lib.rs
#[cfg(test)]
mod tests {
    // `mod tests` is its own context, so functions must be
    //   imported from the library even though the tests are
    //   in the same file
    
    // Imports all functions from file, specifically `add_one`
    use super::*;

    #[test]
    fn ut_add_one() {
        let x: u32 = 5;
        let result = add_one(x);
        assert_eq!(x + 1, result); 
    }
}
```
</p>
</details>

5) Add an [integration test](https://doc.rust-lang.org/rust-by-example/testing/integration_testing.html) for `add_one`
- This should go into a new file: `tests/integration_test.rs`

<details><summary>Solution</summary>
<p>

```rust
// Top of tests/integration_test.rs
#[test]
fn it_add_one() {
    let x: u32 = 5;

    // No imports needed, all public functions
    //  from all libraries are accessible by
    //  integration tests
    assert_eq!(adder::add_one(x), x+1);
}
```
</p>
</details>

- You may get the following compilation error:

```rust
error[E0603]: function `add_one` is private
 --> tests/integration_test.rs:4:23
  |
4 |     assert_eq!(adder::add_one(x), x+1);
  |                       ^^^^^^^ private function
```

- To test this function in `integration_test.rs`, we need to make `add_one` public.
  - `pub fn add_one(x: u32) -> u32`
- This emphasizes what integration tests are for!
  - Integration tests should validate the *public* interfaces (inputs and outputs) of a module
  - These tests provide confidence that *other* modules can interact with this module's public interfaces without causing an error
  - By proving this, we verify module *integration*, the inter-operation of multiple modules as a successful whole

6) Modify `add_one` to instead update `x` in place, with no return value.
- You'll learn more about `mut`, references, and `&mut`!
- Hint: https://www.educative.io/answers/how-to-use-references-in-rust

<details><summary>Solution</summary>
<p>

```rust
// in src/lib.rs
// Pass a mutable/editable reference to the variable: &mut 
pub fn add_one(x: &mut u32) {
    // Since X is now a pointer (&), must dereference with *
    *x += 1
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn ut_add_one() {
        let mut x: u32 = 5;
        let orig = x;

        // Error if we try add_one(x)
        // Add one only accepts a mutable pointer
        // with &mut we pass the pointer to x to the function
        add_one(&mut x); // no return value!
        assert_eq!(orig + 1, x); 
    }
}
```
```rust
// in tests/integration_test.rs
#[test]
fn it_add_one() {
    let start: u32 = 5;
    let mut x: u32 = start;
    adder::add_one(&mut x);
    assert_eq!(x, start + 1);
}

```
</p>
</details>

## Level 1 - Generics, Traits, Imports

1) Write a function which returns the largest element of a [vector](https://doc.rust-lang.org/std/vec/struct.Vec.html) of type `u32`
- `fn largest(xs: &[u32]) -> u32`
- Why should `largest` take a pointer to the list (`&[u32]`) instead of the list (`[u32]`)?
    - Consider the size of a pointer versus the size of the list
- Why not a mutable pointer `&mut`?

<details><summary>Solution</summary>
<p>

```rust
// There are several implementations possible
// largest takes a pointer to the vector instead of copying the
//   the whole vector. A pointer is 4 bytes. The vector might
//   be hundreds of bytes
// The pointer is not mutable (&mut[u32]) because we do not want
//   the list to be modified. We only want to find the largest
//   element.
// This is a powerful protection, similar to const arguments in
//   C/C++, but by default.
fn largest(list: &[u32]) -> u32 {
    let mut largest: u32 = list[0];

    // &item means a reference to (and not a copy of) item
    for &item in list {
        if item > largest {
            largest = item;
        }
    }

    largest
}

#[cfg(test)]
mod tests {

    use super::*;

    fn ut_largest() {
        let max = 100;
        let xs = vec![max - 1, max - 10, max - 50];
        assert_eq!(max, largest(&xs));
    }
}
```
</p>
</details>

2) [Modify `largest` to return the largest element of a vector of *any type*](https://doc.rust-lang.org/book/ch10-01-syntax.html)
- This one is tricky!
- You'll learn about Generics and `trait`s, specifically `PartialOrd` and `Copy`

<details><summary>Solution</summary>
<p>

```rust
// How to read:
// return the largest item from list of items of type T
//   where T must be Orderable/Sortable and Copyable
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    // Makes a copy of an element of type T
    //  therefore T must be Copyable
    let mut largest: T = list[0];

    for &item in list {
        // Compares items of type T
        // Greater than (>) operator requires two objects
        //  that can be compared
        // Therefore PartialOrd trait
        if item > largest {
            largest = item;
        }
    }

    largest
}
```
</p>
</details>

- Run the same unit tests again, should pass!
- Try changing the unit tests to add together other types: f32, u8, i16, etc.


3) Add a [data structure](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html) called `Ticket`.
- `Ticket` should have two fields:
    - `u32 id`
    - `DateTime<UTC> timestamp`
- We need to import an external crate: `chrono`
    - [Add `chrono` to your `cargo.toml` under `[dependencies]`](https://crates.io/crates/chrono) (see "Usage")
        - Alternatively run `cargo add chrono` from your project root
    - [Importing DateTime and Utc to your file](https://docs.rs/chrono/0.4.0/chrono/struct.DateTime.html#example) 

<details><summary>Solution</summary>
<p>

```rust
use chrono::{DateTime, Utc};

struct Ticket {
    id: u32,
    timestamp: DateTime<Utc>
}
```

</p>
</details>

4) Create a unit test `ut_largest_ticket` which does the following:
- Creates a vector `tickets` with the following two `Ticket` elements:
    - `Ticket { id: 1, timestamp: Utc::now() }`
    - `Ticket { id: 2, timestamp: Utc::now() + Duration::minutes(30) }`
- Passes this `Ticket` vector to the `largest` function.
- [assert_eq!](https://doc.rust-lang.org/std/macro.assert.html#examples) that the ID of the returned element is `2`.

<details><summary>Solution</summary>
<p>

```rust
#[cfg(test)]
mod tests {

    use super::*;
    // Duration is used in unit tests, but not in library
    // import here
    use chrono::{Duration};

    #[test]
    fn ut_largest() {
        let tickets = vec![
            Ticket { id: 1, timestamp: Utc::now() },
            Ticket { id: 2, timestamp: Utc::now() + Duration::minutes(30) }
        ];
        assert_eq!(2, largest(&tickets).id);
    }
}
```
</p>
</details>

- *Should fail to compile!*

5) The compiler doesn't know how to compare two `Ticket` objects yet.
- Add `#[derive(Debug, Eq, Copy, Clone)]` above `Ticket`
  - [This tells Rust to provide code for copying, checking for equality, and printing this object to standard output.](https://doc.rust-lang.org/rust-by-example/trait/derive.html)

<details><summary>Solution</summary>
<p>

```rust
#[derive(Debug, Eq, Copy, Clone)]
struct Ticket {
    id: u32,
    timestamp: DateTime<Utc>
}
```

</p></details>

6) The compiler needs to be told how to determine if one `Ticket` is "larger" than another.
- We'll say that the "largest" ticket should be the one with the **later** timestamp.
- [Implement the `PartialOrd`, `Ord`, and `PartialEq` traits for the `Ticket` object.](https://doc.rust-lang.org/std/cmp/trait.Ord.html#how-can-i-implement-ord)
- [Traits define behaviors for types](https://doc.rust-lang.org/book/ch10-02-traits.html).

<details><summary>Solution</summary>
<p>

```rust
use std::cmp::Ordering;

#[derive(Debug, Eq, Copy, Clone)]
struct Ticket {
    id: u32,
    timestamp: DateTime<Utc>
}

impl Ord for Ticket {
    fn cmp(&self, other: &Self) -> Ordering {
        self.timestamp.cmp(&other.timestamp)
    }
}

impl PartialOrd for Ticket {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for Ticket {
    fn eq(&self, other: &Self) -> bool {
        self.timestamp == other.timestamp
    }
}
```
</p>
</details>

7) Run the unit tests again.
- Should pass!

## Level 2

- Coming Soon
- `Option`, `trait`, `enum`
