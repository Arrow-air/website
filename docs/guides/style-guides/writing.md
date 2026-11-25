# Writing Style Guide

Arrow writes for a global audience. Most readers didn't follow the conversation that led to what you wrote, and many of them read English as a second or third language. This guide covers anything public: docs, blog posts, READMEs, forum posts and social copy.

Clear writing does three jobs for Arrow. It keeps the brand consistent, it brings in new contributors, and it makes onboarding easier for the people who arrive.

## Write for everyone

- **Plain English.** Skip idioms, slang and in-jokes that only make sense in one country.
- **Metric units.** kg, km, m/s.
- **Times in UTC, 24-hour.** Write 14:00 UTC, not 2:00 PM.
- **Spell out acronyms the first time**, for example vertical take-off and landing (VTOL). Jargon is fine in technical docs, but define it on the way in.
- **Match the reading level to the format.** For everyday communication (posts, Discord, guides and how-tos), aim for a reader aged 13 to 15: short sentences, short paragraphs. You can check with the [Flesch-Kincaid score](https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/). Formal, published documents such as AIPs, proposals, reports and specifications can use the full range of language they need to be precise, as long as they stay clear and define their terms.
- **Break up walls of text.** Use headings, lists and **bold** for the one idea a skimming reader must not miss.
- **Cut what doesn't earn its place.** If a sentence can lose words without losing meaning, it should.

## Make it accessible

Some readers use screen readers or other assistive tools.

- Give every image alt text that says what it shows.
- Caption or describe videos, and don't make sound the only way to get the point.
- Don't rely on color alone to carry meaning.
- Write link text that says where it goes. "Read the AIP process" beats "click here".

## Arrow terms

- **Arrow is a community, not a company.** Use *community*, *contributors* or *the team*. *Company* is fine for other organizations.
- **Name projects in full the first time** (*Project Quiver*), then just *Quiver*.
- **"We" means Arrow and its contributors**, not only the core team.
- **Write $ARROW or ARROW for the token**, and AIP-00N for proposals, linked the first time you mention one.
- **US spelling.** The spell check on every docs pull request flags UK spellings.

## Docs pull requests

- The docs live in [Arrow-air/website](https://github.com/Arrow-air/website). Open pull requests against the `staging` branch.
- Preview your change locally with `npm start` before you open the PR.
- A spell check runs on every pull request. If it trips on a real name or term, add it to `.cspell.project-words.txt`.
- The Quiver, Spearhead and Caribou docs are imported from each project's own repository. Edit those there, not in the website repo.

## Blog posts

1. Write the post in Markdown and open a pull request on the [website](https://github.com/Arrow-air/website/) repository.
2. Before you open it, check that the post:
   - is relevant to Arrow and not an opinion piece
   - doesn't repeat an existing post
   - isn't promotional
   - has been proofread for spelling and grammar
3. The Editors group on GitHub reviews it for fit, then for style. Editors may make stylistic edits as long as the meaning stays the same.
4. Editors do a final pass for inclusiveness, rewording anything too local or that assumes context the reader may not have.
5. Technical posts get a deeper fact-check before they're merged.
