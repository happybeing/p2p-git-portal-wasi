
# Contributor Guidelines
IMPORTANT: If you wish to contribute changes to this repository you must first read and accept to be bound by the terms described in both the LICENSE section of the project [README](./README#license) and in the [Contributor Code of Conduct](./CODE_OF_CONDUCT.md).

<!-- TOC -->

- [Contributor Guidelines](#contributor-guidelines)
- [Introduction](#introduction)
    - [If You Have Questions](#if-you-have-questions)
    - [Issues, Bug Reports and Feature Requests](#issues-bug-reports-and-feature-requests)
    - [Areas Needing Attention](#areas-needing-attention)
    - [Contributing To Code or Documentation](#contributing-to-code-or-documentation)
- [Pull Requests](#pull-requests)
    - [Preparation](#preparation)
    - [Submitting a Pull Request](#submitting-a-pull-request)
- [Front-end and JavaScript wasi-js subsystem](#front-end-and-javascript-wasi-js-subsystem)
    - [Code Formatting](#code-formatting)
    - [Use JSDoc Comments](#use-jsdoc-comments)
    - [Writing Tests](#writing-tests)
- [Contributing to the wasi-rust subsystem](#contributing-to-the-wasi-rust-subsystem)
    - [Set Up Rust Tooling](#set-up-rust-tooling)
    - [Rust Coding Guidelines](#rust-coding-guidelines)
        - [General](#general)
        - [Changing Dependencies and Editing Cargo.toml](#changing-dependencies-and-editing-cargotoml)
        - [Git Commit Messages](#git-commit-messages)
        - [Rustfmt and Clippy](#rustfmt-and-clippy)
        - [Avoid Unsafe Code](#avoid-unsafe-code)
        - [Rust Error Handling](#rust-error-handling)
        - [Don't unwrap](#dont-unwrap)
        - [Don't use: panic, expect or let _ =](#dont-use-panic-expect-or-let-_-)
        - [Threads](#threads)
        - [Function ordering](#function-ordering)
        - [Bringing names into scope use statements](#bringing-names-into-scope-use-statements)
        - [Parameter Types for the Subsystem APIs](#parameter-types-for-the-subsystem-apis)
- [Releases and Changelog](#releases-and-changelog)
- [Credits](#credits)

<!-- /TOC -->

# Introduction
These Contributor Guidelines are mainly directed at development, but non-coders can also contribute in various ways so they are for everyone. All potential contributors should read this Introduction and it's subsections.

Non-coders can help by reviewing and writing documentation, trying things out and providing suggestions, feedback, bug reports and so on. 

Improvements and feedback for these guidelines are also welcome, so feel free to open an issue or submit a PR for review (as explained below).

Developers will find important information on tooling, coding guidelines, handling errors, writing tests, internal documentation, checking code before making a commit, and instructions on how to submit your code for review using a Pull Request (PR) amongst other things.

After the section about Pull Requests there are two sections solely for developers. One for the Svelte front-end and other JavaScript (including the `wasi-js` subsystem), and a second for Rust developers working on the `wasi-rust` subsystem).

## If You Have Questions
Being a product aimed at users of git and github or similar portals, the guidelines assume knowledge of these development tools. If there's anything not covered here or if you have questions which are not directly related to development, please ask on one of our community channels (listed in the README). For development related questions, see the next subsection on 'Issues, ...'.

## Issues, Bug Reports and Feature Requests
Managing and tracking work on this project is done via [GitHub issues](https://github.com/happybeing/p2p-git-portal-wasi/issues). If you have anything to report or ask which relates to development, please search the [existing issues](https://github.com/happybeing/p2p-git-portal-wasi/issues), and open a [new issue](https://github.com/happybeing/p2p-git-portal-wasi/issues/new/choose) if you don't find one that has already been opened.

## Areas Needing Attention
These guidelines will always be subject to review, but the following areas are either not yet covered, or are particularly tentative and could do with input:

- **API error handling** needs a section giving guidance on when and how to propagate (i.e. `throw`) errors arising in either `wasi-js` and `wasi-rust` subsystems.
- **`wasi-rust` error handling** is very tentative, so the approach described needs confirmation or revision as coding progresses.

- **Tests** are only being required for the subsystem APIs at this time, but as the codebase grows we may need to extend this, requiring tests for internal JavaScript functions and Svelte components. For the same reason we may also need to require tests for individual Rust functions (and possibly including the tests contained in comments, as part of the internal documentation).

## Contributing To Code or Documentation
If you wish to contribute changes to this repository you must first read and accept to be bound by the terms described in both the LICENSE section of the project [README](./README#license) and in the [Contributor Code of Conduct](./CODE_OF_CONDUCT.md).

Changes to code, README and other contents of the repository should be made on a fork and then submitted for review as a [GitHub Pull Request](https://github.com/happybeing/p2p-git-portal-wasi/pulls).

# Pull Requests

## Preparation

Before submitting a pull request affecting the front-end or wasi-js subsystem:
- review your code against the front-end and JavaScript coding guidelines
- provide a JSDoc comment for all JavaScript functions 
- if adding significant new code, generate and check the JSDocs output
- provide a test for each new wasi-js API (see `./src/__tests__`)
- run `yarn test` and make sure all tests pass

Before submitting a pull request affecting the wasi-rust subsystem:
- review your code against the Rust coding guidelines
- if you've modified internal APIs see above re wasi-js subsystem APIs
- clear up any issues from `cargo clippy -- -D warnings`
- format using `cargo fmt -- --check`
- run `yarn test` and make sure all tests pass

We recommend using [git hooks](https://githooks.com/) to automate the running of `clippy` and `rustfmt` before each commit, and the running of tests when you `git push`.

## Submitting a Pull Request
Create a temporary branch for the commits you wish to push
and rebase your commits on top of main. So if you made changes to add support for Windows you might do:
```
git checkout -b add-windows-support
git rebase main
```
Resolve any conflicts and commit them.

Push the branch to your fork.

Visit your github fork, create the PR and choose a title that is suitable for a commit message covering all changes in the commit. For example:

     "Add Windows support"

In the PR description, link it with any issues it closes using github keywords such as 'fixes' or 'resolves'. For example:

    "Fixes #2, fixes #5"

During the review process you may be asked to make changes. If so, make your
changes to the same branch and when you push those the PR will automatically
update and the review can continue.

Once the PR passes review someone will accept it, normally using 'squash merge' so that all changes appear as a single commit unless it is decided to merge as is and keep the full commit history.

# Front-end and JavaScript (wasi-js subsystem)
This covers the Svelte front-end in `./src` and JavaScript `wasi-js` subsystem in `./src/wasi-js`. 

For contributions to the Rust `wasi-rust` subsystem in `./src/wasi-rust`, see the section following this one.

## Code Formatting
We plan to use Prettier and the Prettier plugin for Svelte to standardise the format of Svelte, HTML, CSS and JavaScript code. There is an open issue to implement this which includes updating this section: Adopt Prettier for Svelte and JavaScript code formatting [#5](https://github.com/happybeing/p2p-git-portal-wasi/issues/5).

## Use JSDoc Comments
We use JSDocs to generate development documentation so familiarise 
yourself with how to write comments for JSDocs. 

Note: VSCode and other editors have add-ons which will generate
a comment template from a function definition.

## Writing Tests
Testing is based on the internal JavaScript API in `./src/api`. The JavaScript API is used by the front-end to interact with the business-logic implemented in `./src/wasi-js` and `./src/wasi-rust`.

- Every JavaScript API in `./src/api` will have it's own test, and include documentation using JSDoc comments.

- If you extend or modify the `wasi-js` API in `./src/api` add to or update the tests in `./src/__tests__`.

- Run `yarn test` or `yarn test:build` to run the tests on development or production. More test commands are documented in the main README.

Tests are currently all in `./src/__tests__/index.js` but will be split into separate files (`uvu` 'suites') as the API grows. See the `uvu` [documentation](https://github.com/lukeed/uvu) for more on writing tests and how to split them into suites.

Continuous Integration (CI) on github is used to run the tests automatically on new and updated Pull Requests so it helps if you make sure all tests pass before opening a pull request, as well as ensuring there is adequate coverage for any changes you contribute.

# Contributing to the wasi-rust subsystem
This section is for contributors to the Rust `wasi-rust` subsystem in `./src/wasi-rust`.

## Set Up Rust Tooling
We currently always use the latest Rust stable toolchain, managed with `rustup`. So first install `rustup`:
```sh
https://www.rust-lang.org/tools/install
```

To install/update to Rust stable:
```sh
rustup update stable
```
Install `rustfmt`, `clippy` and `cargo-edit`:
```sh
rustup component add rustfmt
rustup component add clippy
cargo install cargo-edit
```

Before committing run `rustfmt` and `clippy`. We recommend [setting up a git hook](https://githooks.com/) to do this automatically. Example commands to do this
manually:
```sh
cargo fmt
cargo clippy
cargo clippy --all-targets
```

Use `cargo-edit` (see [crate](https://lib.rs/crates/cargo-edit)) to add remove and update modules:
```sh
cargo add <module>
cargo rm <module>
cargo upgrade <module>
```

## Rust Coding Guidelines

Please familiarise yourself with all of this section and when you see anyone deviating from it without obvious good reason let them know.

### General
Firstly please familiarise yourself with idiomatic Rust coding conventions by reading *The Rust Book* which you can find at [Learn Rust](https://www.rust-lang.org/learn).

Beware Rust examples! Most example code including those in official and crate documentation show how NOT to do error handling. So pay particular attention to the section below on Error Handling.

### Changing Dependencies and Editing Cargo.toml

Adding new dependencies should be discussed first by opening an issue. Using an issue helps us keep track of why a dependency was selected or rejected.

Use `cargo-edit` to update dependencies or keep the `Cargo.toml` in the formatting that `cargo-edit` uses.

### Git Commit Messages

The first line of the commit message should no more than seventy characters and phrased as an action, avoiding describing the implementation. Examples:

- "Add build section to README"
- "Fix #23: misleading message when save config fails"
- "Convert front-end to tailwind CSS"

If more details or comments about implementation are needed, continue on subsequent lines. Note that you can reference and automate the linking and closure of issues by including a [github commit keyword](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) (e.g. 'fixes #23') before the `#nn` issue reference.

### Rustfmt and Clippy
As explained under tooling, you should use `rustfmt` and `clippy` on all code prior to commit, and can automate this by [setting up a git hook](https://githooks.com/) in your fork. For example:
```sh
cd ./src/wasi-rust
cargo fmt
cargo clippy
cargo clippy --all-targets
```

### Avoid Unsafe Code
Unsafe Rust is only allowed where necessary and in general *should be justified by an explanation* in code comments.
### Rust Error Handling
There are three things to remember when returning an error from a Rust function:

- **Internal `wasi-rust` functions should return `anyhow::Result` rather than a custom error type**

- **API `wasi-rust` functions should return `std::Result` using `thiserror` to provide a custom error type which implements `std::error::Error`**

   We treat `wasi-rust` functions exposed to the API using `wasm-bindgen` *as if* this is a library, with the intention of making context and detail available to the JavaScript APIs.

- **Consider when to handle and when to propagate**
   
   This means always making a conscious decision to handle errors at a given level rather than always in the function or always passing them up. Some errors need to be passed all the way to the front-end, some can be handled where they occur and some will best be handled at an intermediate point. In all cases it is necessary to 'design' the error to ensure that wherever it is being handled, the handler has the information it needs to deal well with the situation.

*More on Rust Error Handling*

   *`anyhow` and `thiserrror`* - a good explanation of when to use `anyhow` and `thiserror` can be found in *Rust Error Handling* by Nick Groenen ([May, 2020](https://nick.groenen.me/posts/rust-error-handling/))

   *`std::io::Error`* - many `wasi-rust` operations act on a filesystem which means that understanding `std::io::Error` will be helpful, and a good concise article on this is *Study of `std::io::Error`* by Aleksey Kladov ([October, 2020](https://matklad.github.io/2020/10/15/study-of-std-io-error.html)).


*Subject to Review*

The approach to handling errors depends on whether errors are being handled internally (e.g. an application) or externally (e.g. a library), but the way *we* handle errors in Rust will need to be reviewed in the light of practical experience. 

After researching the options we decided to use `anyhow` in situations where you will be handling the error inside the `wasi-rust` subsystem, and `thiserror` (which implements `std::error::Error`) where the function is exposed via `wasm-bindgen` (for `./src/api`). 

The `wasi-rust` subsystem is a component of the application rather than a library used by different applications, but we are implementing error handling as if it was a library because the `wasi-rust` subsystem will only be consumed by a JavaScript API. We therefore believe error handling and propagation (e.g. `throw`) will benefit from a library style approach.

### Don't `unwrap`
`unwrap` will abort if an error exists so don't `unwrap` an `Option` or `Result` except possibly when:

1. Locking a mutex
2. Spawning a thread
3. Joining a thread
4. Writing tests or examples
5. In other patterns where using them makes the code much simpler and it is obvious at first glance to the reader (even one unfamiliar with the code) that the value cannot be `None`/`Err`. In these cases, prefer to use the macro from the unwrap [crate](https://crates.io/crates/unwrap).

### Don't use: `panic`, `expect` or `let _ =`

- `panic` (aborts program)
- `expect` (aborts with message)
- `let _ =` (this implies "this is a Result and I am gonna ignore the return type and keep going as I know better than the compiler, or at least I think I do.")

### Threads

Generally avoid detached threads. Give child threads meaningful names.

This can easily be achieved by preferring to create child threads using [`maidsafe_utilities::thread::named()`](http://docs.maidsafe.net/maidsafe_utilities/master/maidsafe_utilities/thread/fn.named.html).

    it returns a `Joiner` which helps to avoid detached threads
    it requires that the child thread is given a name

### Function ordering

In `impl`, always put public functions before private ones.
### Bringing names into scope (`use` statements)

`use` statements should bring the module rather than the function into scope, so that using the function requires one level of qualification. For example, if we have:
```rust
pub mod a {
    pub mod b {
        pub struct Harbour {}
        pub fn bar() {}
    }
}
```
then the normal use statement to bring these into scope would be:
```rust
use a::b::{self, Harbour};
```
Exceptions may be made in future and noted in this section. For example, where Git Portal has a utility crate, where disambiguation is obvious and using a module prefix would be unhelpful.

### Parameter Types for the Subsystem APIs
Functions which consume or return values from or to internal APIs (`./src/api/index.js`) need to use types designed for passing via `wasm-bindgen`. There are no strict rules for this, so look at what we have already and whether you think it is suitable or could be improved, and open an issue to discuss options or changes to what you find in place. 

# Releases and Changelog
While we are in a pre-release phase releases will be triggered manually by applying [SemVer](https://semver.org/) version using `git tag`.

At this point we don't maintain a change log so we use the commit history, so it helps if you can make your commit messages, PR title and PR descriptions succinct and informative.

# Credits
The section on Rust was helped by and in part based on the MaidSafe Contributor Guidelines and Rust Style guide, and comments by David Irvine in a Safe Forum [discussion](https://safenetforum.org/t/learning-rust/32089/29?u=happybeing).
