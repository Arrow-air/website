---
sidebar_position: 3
---
# Development Guide

## :paw_prints: First Steps
1. Create an account: [GitHub](https://github.com/)
2. Create an account: [Discord](https://discord.com/)
3. Sign the [CLA](https://www.arrowair.com/docs/contributing/cla)
4. Join the [Arrow Discord](https://discord.com/invite/fab4bxaAW9)
   - Be sure to visit the `#start-contributing` channel and give yourself a role!

## :round_pushpin: Claim a Task
1. Visit the [Arrow DeWork](https://app.dework.xyz/arrow-air)
2. Sign in with your Discord credentials
3. View open tasks
    - ![DeWork - Open Tasks](./assets/opentasks_dework.png)
4. Claim a task, easy as a button click!
    - ![DeWork - Claim Task](./assets/dework_claim.png)
    - Some important tasks are by **application only**. Describe why you're a good fit for the task!

## :wrench: Work On a Task
1. Clone or fork the target repository.
    - If you are not a core member on an [Arrow GitHub team](https://github.com/orgs/Arrow-air/teams), you will need to work from a fork.
    - [How to Fork a Repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
2. Create a branch.
    - Your branch name should be clearly related to the task you're working on!
    - Use the suggested branch name:
      - ![DeWork - Suggested Git Branch Name](./assets/dework_branch.png)
3. Code!
    - Be sure to follow our [Code Style Guides](./styleguides/intro.md)!
4. Commit your changes and push to the remote.

## :checkered_flag: Push Changes
1. Make a pull request.
    - A "Pull Request" is a request to merge your branch into the `main` branch.
    - [How to create a pull request from a fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork).
    - If making edits to the [website](https://github.com/Arrow-air/website/), seek to merge your PR into the website `staging` branch instead.
2. Confirm the presence of the `cla-signed` label.
    - If you haven't signed the [CLA](./cla.mdx), the cla-bot will be disappointed :angry:
3. Confirm that the GitHub Actions checks pass.
     - These checks will vary from repository to repository
     - ![GitHub - Checks](./assets/github_checks.png)
4. Get two approvals.
5. Merge!

## :books: Repositories (Create, Modify, Delete)

Repositories are managed through [Terraform](https://www.terraform.io/).

Requests for repository management should be made to @owlot.

## :closed_lock_with_key: Admin Access

Elevated access to our various team platforms is limited.

Ping @thomasg or @owlot and describe what you want to do.