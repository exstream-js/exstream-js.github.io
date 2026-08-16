# AGENTS.md

## Purpose

This repository is the public documentation portal for Exstream. Optimize every change for a backend JavaScript or TypeScript developer who needs to process large record flows without rebuilding backpressure, bounded concurrency, fan-out, cancellation, and cleanup.

The site teaches first and promotes second. It should be useful even when the honest answer is to use native JavaScript instead of Exstream.

## Source of truth

The sibling `../exstream` repository defines product behavior. Before documenting an API or support claim, verify it against the public code, types, tests, and these files:

- `../exstream/README.md` — current public positioning and examples;
- `../exstream/ROADMAP.md` — product and documentation roadmap;
- `../exstream/ADOPTION-ROADMAP.md` — adoption and distribution principles;
- `../exstream/SUPPORT.md` — supported runtimes;
- `../exstream/MIGRATION.md` — compatibility and migration guidance.

Do not turn roadmap proposals into statements of shipped behavior.

## Stack

- Svelte 5 and SvelteKit for components, routing, prerendering, and static output;
- mdsvex for versioned Markdown documentation;
- Pagefind for a build-time, local search index;
- Tailwind CSS 4 through the Vite plugin for design tokens and utilities;
- TypeScript in strict mode;
- Oxlint and Oxfmt for linting and formatting;
- `@sveltejs/adapter-static` for deployment-independent static assets.

The production build is written to `build/`. `npm run build` runs Pagefind after SvelteKit so the search index describes the final HTML.

## Editorial rules

1. One page answers one obvious question.
2. Put runnable, copyable code before long conceptual explanations.
3. State operator contracts explicitly: input/output, sync/async behavior, backpressure, buffering, order, concurrency, errors, cancellation, runtime, hot-source behavior, and edge cases.
4. Prefer stable, descriptive URLs. Do not move published pages without adding redirects.
5. Explain when not to use Exstream. Avoid unsupported performance claims and generic superlatives.
6. Write for humans and retrieval systems: descriptive headings, explicit terminology, complete examples, canonical metadata, and no meaning hidden only in animation.
7. Keep examples aligned with the released package. Examples intended for publication should eventually be exercised in CI.

Public content is in English unless a page is explicitly localized.

## Visual and implementation rules

- Keep the homepage path short: problem, working code, technical proof, quick start.
- Use the flow/fork motif, warm neutral backgrounds, near-black surfaces, and one orange data-flow accent.
- Prefer typography, CSS, and small semantic diagrams over decorative imagery.
- Keep documentation usable without JavaScript. Interactive components must be isolated and progressively enhanced.
- Respect keyboard navigation, screen readers, `prefers-reduced-motion`, and system color preference.
- Avoid dependencies for effects that CSS can express clearly.
- Target less than 100 KB of compressed initial JavaScript and Lighthouse scores of at least 95 on primary pages.

## Commands

```shell
npm run dev          # local development
npm run check        # Svelte and TypeScript checks
npm run lint         # lint scripts and components
npm run format       # format the repository
npm run format:check # verify formatting
npm run build        # static build and Pagefind index
npm test             # complete local quality gate
```

Use npm and preserve `package-lock.json`. Node.js 22 is the minimum supported development runtime.
