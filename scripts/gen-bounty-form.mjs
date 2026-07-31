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

// One abstract color glyph per category, approximating its hex in the taxonomy.
// Used only to group the 43-item discipline checklist visually — the same glyphs
// the contributor-map Discord bot uses, so the taxonomy looks consistent
// wherever a contributor meets it.
//
// These prefix the checkbox label, never the Category dropdown. sync-bounties.mjs
// takes everything after the first colon ("Engineering: CAD" -> "CAD"), so a
// prefix is discarded harmlessly, but the dropdown value is an exact map lookup
// that throws on a miss.
const CATEGORY_GLYPH = {
    Engineering: '🔷',
    'Flight Systems': '🟦',
    'Flight Ops': '🟧',
    Manufacturing: '🟫',
    Design: '🟥',
    Content: '🟪',
    Growth: '🟩',
    Local: '🟨',
    Operations: '⬛',
};

const categoryOptions = taxonomy.categories
    .map(category => `        - ${category.name}`)
    .join('\n');

const disciplineOptions = taxonomy.categories
    .flatMap(category => category.disciplines.map(d =>
        `        - label: "${CATEGORY_GLYPH[category.name] ?? '▪️'} ${category.name}: ${d.name}"`))
    .join('\n');

const template = `# GENERATED FILE — do not edit the Category or Skills options by hand.
# Regenerate with: node scripts/gen-bounty-form.mjs
# Taxonomy source: ${TAXONOMY_PATH} (v${taxonomy.version})
name: Bounty
description: Create a bounty-backed work item
labels: ["bounty:proposed"]
body:
  - type: markdown
    attributes:
      value: |
        The board-entry fields power the public bounty board; the spec fields tell a contributor what to actually do.

        **Fill in at least one reward** — USDC, ARROW, or both. A bounty with neither is rejected by the board sync.

        Only **Category**, a reward, the board description, scope, deliverables and acceptance criteria are required. Skip the rest if they don't apply.

        Submitting adds the \`bounty:proposed\` label. A maintainer applies \`bounty\` to publish it to the board.

  - type: dropdown
    id: category
    attributes:
      label: Category
      description: Used to group this bounty on the bounty board. See the disciplines guide at https://arrowair.com/docs/community/disciplines
      options:
${categoryOptions}
    validations:
      required: true

  - type: dropdown
    id: project
    attributes:
      label: Project
      description: Which project this belongs to. Active projects per AIP-007.
      options:
        - Project Quiver
        - Project Spearhead
        - Project Caribou
        - Project Longshot
        - Cross-project
        - DAO / Governance

  - type: input
    id: reward_usdc
    attributes:
      label: USDC reward, optional
      description: Numeric amount only.
      placeholder: "800"

  - type: input
    id: reward_arrow
    attributes:
      label: ARROW reward, optional
      description: Numeric amount only.
      placeholder: "2500"

  - type: dropdown
    id: expected_window
    attributes:
      label: Expected completion window
      description: Rough guide for how long this should take once claimed.
      options:
        - "~1 week after assignment"
        - "~2 weeks after assignment"
        - "~1 month after assignment"
        - "Flexible"

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
      description: Drag an image into any comment box to get a URL. Roughly square, under 500 KB.
      placeholder: "https://..."

  - type: textarea
    id: card_description
    attributes:
      label: Short bounty board description
      description: 1–2 sentences. This is the public card text on the bounty board.
      placeholder: "Create a practical 3D-printed battery base using the Longshot/Tattu reference geometry."
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
      description: The quality bar the deliverables must clear. Be specific — this is what settles a "technically delivered but not good enough" dispute.
      placeholder: |
        - Physical fit is checked against the reference assembly
        - Pinout/pad positions/mounting interfaces are correct
        - Required assumptions are documented
    validations:
      required: true

  - type: textarea
    id: notes_and_links
    attributes:
      label: Notes & links, optional
      description: Non-goals, things not to change, dependencies, related issues or PRs.
      placeholder: |
        - Don't modify unrelated components — note follow-ups instead
        - Related issue: #14
`;

writeFileSync(OUTPUT_PATH, template);
console.log(`Wrote ${OUTPUT_PATH} — ${taxonomy.categories.length} categories, ${taxonomy.categories.reduce((n, c) => n + c.disciplines.length, 0)} disciplines (taxonomy v${taxonomy.version}).`);
