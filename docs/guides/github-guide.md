---
sidebar_position: 2
description: A guide to using GitHub for Arrow contributions.
---

# GitHub Guide

Everything Arrow builds lives on GitHub, in the open, under the [Arrow-air organization](https://github.com/Arrow-air). Aircraft designs, firmware, this documentation site, even the DAO's governance proposals are all repositories anyone can read and contribute to.

This page is a map of the organization and how contribution flows through it. For the technical workflow, branching, commit signing, and pull request mechanics, see the [Development Guide](/docs/guides/development-guide).

## The repositories that matter most

The organization has a lot of repos. Right now, these are the ones you'll touch most often, though the list shifts as projects spin up and others wind down.

| Repository | What it holds |
|------------|---------------|
| [website](https://github.com/Arrow-air/website) | This website and documentation site, including the bounty board |
| [dao-aips](https://github.com/Arrow-air/dao-aips) | Arrow Improvement Proposals, the DAO's governance record |
| [project-quiver](https://github.com/Arrow-air/project-quiver) | Project Quiver designs, docs, and artifacts |
| [project-caribou](https://github.com/Arrow-air/project-caribou) | Project Caribou, the open-source heavy-lift hexacopter |
| [project-spearhead](https://github.com/Arrow-air/project-spearhead) | Project Spearhead designs, docs, and artifacts |

Each active project keeps its own `project-*` repository, and their docs are imported into this site automatically, so a merged change to a project repo shows up here without any extra work.

## Finding something to work on

Issues are how work is advertised. Two kinds are worth knowing about:

- **Bounties** are funded issues, posted with a reward and a defined scope. They appear as GitHub issues labeled `bounty` in the website repo and are published on the [bounty board](/bounty). If you want paid, well-scoped work, start there and read [What are Bounties?](/bounty/bounties/what-are-bounties).
- **Regular issues** are everything else: bugs, ideas, and improvements that need an owner. They're unfunded but they are also how many contributors build trust before taking on bigger funded work.

A note on how bounties are awarded: they don't automatically go to the first person to apply or to open a PR. Some are a better fit for contributors who have been around Arrow a while and have a track record of impactful work, and maintainers weigh that when awarding. We want to share the workload, but outstanding work comes first. Pointing an AI at our repos to farm bounties and bulk-generate solutions isn't what this is for; we care about crafted work, and we reward people who care about Arrow rather than treating it as one more bounty pot.

You don't need an issue to contribute. If you spot something broken or unclear, a pull request that fixes it is always welcome. For anything significant, open an issue or post in Discord first so the effort isn't duplicated.

Be aware that pull requests can be declined, and the most common reason is the blind submission: a sizeable change nobody discussed anywhere public first. A quick temperature check saves everyone the awkward version of that conversation. Something like "hey, I'd like to add X to the docs. Is it a good idea? Anything I should know first? Here's a rough outline, feedback appreciated" posted in Discord or an issue is usually all it takes, and it often improves the idea before a line is written.

## Before your first pull request

1. **Sign the CLA.** Every contributor signs a Contributor License Agreement once, which keeps the open-source licensing of everything Arrow builds clean. The [CLA guide](/docs/guides/sign-cla) walks through it, and the CLA bot will prompt you on your first PR if you haven't.
2. **Set up commit signing.** All commits to Arrow repos must be signed. The [Development Guide](/docs/guides/development-guide) covers the setup.
3. **Work from a fork** unless you're a member of an [Arrow GitHub team](https://github.com/orgs/Arrow-air/teams). Fork the repo, branch, and open your PR against the upstream repository.

## What to expect from review

Every change lands through a pull request, including those from long-standing contributors. Reviews usually arrive within a few days, async, from whoever knows that corner of the codebase. Checks run automatically on each PR, spelling, link integrity, code style, and the CLA, and a green build is required before merge.

Review comments are about the work, never the person. Questions in a review are genuine questions, not rejections. If a review stalls or you're unsure who should look at it, ask in Discord.

## You don't have to be a developer

Plenty of valuable GitHub contributions involve no local setup at all. Every docs page has an **Edit this page** link that opens the file on GitHub, where you can fix a typo or clarify a paragraph entirely in the browser and GitHub will fork, branch, and open the PR for you. Writing an issue that clearly describes a problem is a contribution too, and often a more valuable one than the fix.
