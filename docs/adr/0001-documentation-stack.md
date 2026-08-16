# ADR 0001: Documentation stack

- Status: accepted
- Date: 2026-08-16

## Context

The Exstream portal must combine a short product homepage, example-first documentation, stable content URLs, local search, and occasional isolated interactions. The default output must remain static, fast, accessible, deployable without an application server, and readable without client-side JavaScript.

Documentation belongs beside the website code and must be straightforward to review as text. Search must not require a hosted service. The initial compressed JavaScript budget is 100 KB, with a preference for substantially less on documentation pages.

## Decision

Use:

- Svelte 5 and SvelteKit for the UI and file-based routes;
- `@sveltejs/adapter-static` with full prerendering;
- mdsvex for Markdown documentation with access to small Svelte components;
- Pagefind to index the generated HTML after each production build;
- Tailwind CSS 4 through its Vite plugin for tokens and concise layout utilities;
- system fonts, CSS diagrams, and isolated enhancement instead of a client-heavy design system.

Search loads its Pagefind runtime only when opened and queried. The homepage and documentation content remain usable when JavaScript is unavailable.

## Alternatives considered

### Plain Svelte components for all content

This keeps one file format but makes long-form documentation harder to review, migrate, and consume outside the site. Rejected for documentation pages.

### A hosted search service

This can add typo tolerance and analytics but introduces a network dependency, credentials, and external indexing. Pagefind is sufficient for the initial static corpus.

### A documentation-specific theme or framework

This would accelerate generic navigation but work against the distinct Exstream product story and its code-first home. SvelteKit provides the smaller foundation while keeping the content portable.

## Consequences

- The portal can deploy to GitHub Pages or any static host.
- Search results update only after a production build.
- Interactive documentation must be implemented as small Svelte islands and justified individually.
- Content authors can use normal Markdown, but page metadata and richer callouts may include Svelte markup.
- Redirects, link checking, executable snippets, and documentation versioning remain follow-up foundation work.
