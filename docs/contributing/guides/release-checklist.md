---
sidebar_position: 3
---

# Release Checklist

## :bust_in_silhouette: Developer

### :hatching_chick: Review Branch & Pull Request

1. Create a new branch from `develop`.

![Creating a Branch for Review](/images/release-branch.png)
![Naming the review branch](/images/release-branch-name.png)

2. Create a Pull Request from your review branch to `main`.

![Creating a PR for Review](/images/release-pr.png)

This method allows the developer and reviewer to see all changes since the previous release.

Why not create a `develop` -> `main` PR for the review?
- Peer reviewers may request code changes.
- `develop` is a protected branch that can only be pushed into through a PR.
- Using an unprotected branch `r#-final-review` allows direct pushes to address review comments.

### :scissors: Clean Up Commit History

1. On the `r#-final-review` PR, view your commit history since last release:

![Commit history with many unnecessary commits, Terraform automations](/images/dirty-review-branch.PNG)

2. Use the oldest commit SHA listed in the PR commit history to interactive rebase the `r#-final-review` branch.
    - `git rebase -i <commit SHA>`

3. Use `fixup`, `reword`, and `squash` to clean up the commit history, confirming to [conventional commit specification](https://www.conventionalcommits.org/en/v1.0.0/#specification).
    - `fix:`, `feat:`, `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`
    - Try to use `docs(<doc abbreviation>):` for updates in the `docs` folder, e.g. `docs(sdd):`

![Clean commit history after rebase](/images/cleaned-review-branch.PNG)

### :mag: Hold Review

1. Inform peer reviewer(s) and await review comments.
2. Push review fixes to your `r#-final-review` branch.
3. After approval(s), when your code is passing all CI checks, you may merge to `main`.

### :broom: Cleanup

:exclamation: Only perform this section once your review branch is merged into `main`!

1. Delete the `develop` branch.
2. Create a `develop` branch from `main`.
    - This uses the cleaned up history from our review branch to continue development.
3. View your active branches in the GitHub interface and delete any that are no longer desired.

## :busts_in_silhouette: Peer Reviewers

This is the *last chance* for a review of the code before it is immortalized forever as a new release.

Some checks aren't currently automated.

If you are a *reviewer* (not the dev!) please paste the following comment template into the review:
```
(Posted by the reviewer!)

## Documents
- [ ] ICD
  - [ ] Current interfaces (grpc & rest)
  - [ ] Current relevant document links
- [ ] SDD
  - [ ] Description of grpc & rest handler implementations
  - [ ] Current sequence diagrams where applicable
  - [ ] Current relevant document links
- [ ] CONOPS
  - [ ] Current information
  - [ ] Bibliography (if any citations)
- [ ] README (see svc-cargo for example)
  - [ ] Badges
  - [ ] Accurate installation instructions
  - [ ] Current links to other documents
  - [ ] Arrow DAO links

## Code (not applicable to examples/ folder)
- [ ] No unhandled unwrap()s
- [ ] Accurate (!) code comments on all functions
- [ ] No `# Arguments` and `# Returns` in function comments
- [ ] Function arguments checked where possible
- [ ] Sufficient logger (info, warn, and debug) messages
- [ ] Sensible Types (unsigned vs. signed)

## REST API
- [ ] Return codes accurately documented with openapi
- [ ] Return codes make sense
- [ ] Sufficiently descriptive error messages

## Cargo.toml(s)
- [ ] Package versions correct
- [ ] No minor versions specified
- [ ] Links to crates.io package, not git branch
```

(Confirm items with an `x`, e.g. `- [x] Lorem ipsum`)

The above template will be updated for future releases.
