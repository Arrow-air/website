#!/usr/bin/env node
// Regenerates .github/ISSUE_TEMPLATE/bounty.yml from the canonical disciplines
// taxonomy (src/data/disciplines.json) so the issue form can never drift from
// the approved category/discipline list. Run after any taxonomy change:
//
//   node scripts/gen-bounty-form.mjs
//
// Everything outside the Category dropdown and the Skills checkboxes is
// authored here verbatim — edit this template, then regenerate.

import { readFileSync, writeFileSync } from 'node:fs';

const TAXONOMY_PATH = 'src/data/disciplines.json';
const OUTPUT_PATH = '.github/ISSUE_TEMPLATE/bounty.yml';

const taxonomy = JSON.parse(readFileSync(TAXONOMY_PATH, 'utf8'));

const categoryOptions = taxonomy.categories
    .map(category => `        - ${category.name}`)
    .join('\n');

const disciplineOptions = taxonomy.categories
    .flatMap(category => category.disciplines.map(d => `        - label: "${category.name}: ${d.name}"`))
    .join('\n');

const template = `# GENERATED FILE — do not edit the Category or Skills options by hand.
# Regenerate with: node scripts/gen-bounty-form.mjs
# Taxonomy source: ${TAXONOMY_PATH} (v${taxonomy.version})
name: Bounty
description: Create a bounty-backed work item
labels: ["bounty"]
body:
  - type: markdown
    attributes:
      value: |
        Create a bounty-backed work item. The short board-entry fields power the public bounty board; the spec fields explain what needs to be done.

  - type: dropdown
    id: category
    attributes:
      label: Category
      description: Used to group this bounty on the bounty board. See the disciplines guide at https://arrowair.com/docs/community/disciplines
      options:
${categoryOptions}
    validations:
      required: true

  - type: input
    id: project
    attributes:
      label: Project
      description: Project or area this bounty belongs to.
      placeholder: Longshot, Quiver, Spearhead, Cross-project, DAO
    validations:
      required: true

  - type: input
    id: reward_usdc
    attributes:
      label: USDC reward, optional
      description: Numeric amount only. Leave blank for ARROW-only bounties. At least one reward field should be filled.
      placeholder: "800"

  - type: input
    id: reward_arrow
    attributes:
      label: ARROW reward, optional
      description: Numeric amount only. Leave blank for USDC-only bounties. At least one reward field should be filled.
      placeholder: "2500"

  - type: input
    id: expected_window
    attributes:
      label: Expected completion window
      description: How quickly this should be completed after someone claims it.
      placeholder: "~1 week after assignment"
    validations:
      required: true

  - type: input
    id: expiry_date
    attributes:
      label: Expiry date, optional
      description: Use if this bounty should expire or be reviewed after a calendar date.
      placeholder: "2026-06-30"

  - type: checkboxes
    id: skills
    attributes:
      label: Disciplines
      description: Select the disciplines this bounty calls for (shown as tags on the board, matched against contributor profiles). Full guide — https://arrowair.com/docs/community/disciplines
      options:
${disciplineOptions}

  - type: input
    id: thumbnail
    attributes:
      label: Thumbnail image URL, optional
      description: Paste or drag an image into the issue editor, then use the generated image URL here. Prefer JPG/PNG/WebP under 500 KB, roughly square if possible.
      placeholder: "https://..."

  - type: textarea
    id: card_description
    attributes:
      label: Short bounty board description
      description: 1–2 sentence public summary for the website card.
      placeholder: "Create a practical 3D-printed battery base using the Longshot/Tattu reference geometry."
    validations:
      required: true

  - type: textarea
    id: summary
    attributes:
      label: Summary
      description: Human-readable task framing.
      placeholder: "Design a 3D-printable base for the Longshot battery."
    validations:
      required: true

  - type: textarea
    id: reference_material
    attributes:
      label: Reference material
      description: Links, repo paths, images, assemblies, related issues, or PRs.
      placeholder: |
        - Fusion reference/test design: https://...
        - Project path: ...
        - Related issue: #...

  - type: textarea
    id: scope
    attributes:
      label: Scope
      description: What work is included in this bounty.
      placeholder: |
        Create a design that:
        - Fits the reference geometry
        - Uses existing mounting points where possible
        - Is practical to manufacture
    validations:
      required: true

  - type: textarea
    id: deliverables
    attributes:
      label: Deliverables
      description: What the contributor must submit.
      placeholder: |
        - CAD/KiCad/source files
        - Neutral exports if practical
        - Short notes documenting assumptions
    validations:
      required: true

  - type: textarea
    id: acceptance_criteria
    attributes:
      label: Acceptance criteria / critical requirements
      description: How reviewers decide whether the bounty is complete.
      placeholder: |
        - Physical fit is checked against the reference assembly
        - Pinout/pad positions/mounting interfaces are correct
        - Required assumptions are documented
    validations:
      required: true

  - type: textarea
    id: constraints
    attributes:
      label: Constraints / non-goals
      description: What contributors should avoid changing or expanding into.
      placeholder: |
        - Do not modify unrelated components arbitrarily
        - Document required follow-up changes instead

  - type: textarea
    id: related_links
    attributes:
      label: Related issues / PRs, optional
      description: Dependencies or relevant linked work.
      placeholder: |
        - Related issue: #14
        - Related PR: #15
`;

writeFileSync(OUTPUT_PATH, template);
console.log(`Wrote ${OUTPUT_PATH} — ${taxonomy.categories.length} categories, ${taxonomy.categories.reduce((n, c) => n + c.disciplines.length, 0)} disciplines (taxonomy v${taxonomy.version}).`);
