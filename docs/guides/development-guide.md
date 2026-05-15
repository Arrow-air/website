---
sidebar_position: 1
title: Development Guide
description: Technical guidelines for contributing to Arrow's GitHub repositories — Git workflow, commit signing, and build tooling.
---

Technical guidelines for contributing to Arrow's GitHub repositories.

## First Steps

1. Create a [GitHub](https://github.com/) account
2. Create a [Discord](https://discord.com/) account
3. Sign the [CLA](https://www.arrowair.com/docs/contributing/cla)
4. Join the [Arrow Discord](https://discord.com/invite/arrow)
5. Set up commit signing (see [Sign Your Commits](#sign-your-commits))

## Git Workflow

### Working on a Task

1. **Fork or clone** the target repository
   - If you're not a member of an [Arrow GitHub team](https://github.com/orgs/Arrow-air/teams), work from a fork
   - [How to fork a repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

2. **Create a branch** with a descriptive name
   - Use the format: `username/short-description`
   - Example: `thomasg/fix-landing-gear-docs`

3. **Make your changes**
   - Follow our [Code Style Guides](./style-guides/index.md)
   - Keep commits focused and well-described

4. **Sign and push** your commits
   - All commits must be signed (see [Sign Your Commits](#sign-your-commits))
   - `git commit -S -m "fix: correct motor arm dimensions"`

### Pull Requests

1. **Target the correct branch**
   - Most repos: target `develop`
   - Website repo: target `staging`

2. **Confirm the `cla-signed` label** appears
   - If you haven't signed the [CLA](./sign-cla.mdx), the bot will block your PR

3. **Confirm CI checks pass**
   - Checks vary by repository

4. **Get approvals**
   - Approvals generally come from [Arrow team](https://github.com/orgs/Arrow-air/teams) members
   - Number of required approvals varies by repo

5. **Merge!**

**PR Best Practices:**
- Keep PRs small and focused — easier to review
- Write clear descriptions of what changed and why
- One PR per issue/task
- If commit history is messy, use "Squash and Merge"

---

## Sign Your Commits

We require signed commits for security and accountability.

**Setup:**
1. [Generate a GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)
2. [Tell Git about your key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key)
3. [Add the key to GitHub](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account)
4. Enable signing by default: `git config --global commit.gpgsign true`

Sign individual commits with `-S`: `git commit -S -m "your message"`

---

## Commit Messages

We use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for automated releases and changelogs.

```
<type>[(scope)]: <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Description | Release |
|------|-------------|---------|
| `fix` | Bug fix | Patch |
| `feat` | New feature | Minor |
| `docs` | Documentation only | Patch |
| `refactor` | Code restructuring | Patch |
| `test` | Adding/updating tests | Patch |
| `build` | Build system changes | Patch |
| `ci` | CI configuration | Patch |
| `perf` | Performance improvement | Patch |
| `style` | Code formatting | Patch |

**Breaking changes:** Add `!` after the type (e.g., `feat!: redesign API`) for a Major release.

**Guidelines:**
- Title: max 50 characters, start lowercase, no period
- Body: max 72 characters per line
- Keep it concise and descriptive

---

## VS Code Extensions

Recommended extensions for Arrow development:

### General
```bash
ext install bierner.github-markdown-preview
ext install docsmsft.docs-yaml
ext install stkb.rewrap
ext install eamodio.gitlens
ext install ms-vscode-remote.vscode-remote-extensionpack
ext install tamasfe.even-better-toml
ext install EditorConfig.EditorConfig
```

- **GitHub Markdown Preview** — Mermaid diagrams and emoji in preview
- **docs-yaml** — YAML intellisense and validation
- **Rewrap** — Wrap comments to 80 characters
- **GitLens** — Git blame and history on hover
- **Remote Development** — SSH development
- **Even Better TOML** — Rust config file support
- **EditorConfig** — Consistent editor settings

### Web Projects
```bash
ext install esbenp.prettier-vscode
ext install johnsoncodehk.volar
```

- **Prettier** — Auto-formatting
- **Volar** — Vue.js support

### Terraform
```bash
ext install 4ops.terraform
```

---

## Build Automation

Arrow repos use Makefiles with containerized tooling via [arrow-sanitychecks](https://ghcr.io/arrow-air/tools/arrow-sanitychecks).

```bash
make help      # See all targets
make test      # Run all tests/lints
make all       # Test, build, and release
```

You don't need to install linting tools locally — everything runs in Docker.

---

## Repository Management

Repositories are managed through Terraform. For repo changes, contact @owlot.

## Admin Access

Elevated platform access is limited. Ping @thomasg or @owlot with what you need.
