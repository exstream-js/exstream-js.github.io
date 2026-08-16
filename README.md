# Exstream website

The documentation portal for [Exstream](https://github.com/micheletriaca/exstream), composable streaming ETL for JavaScript.

The site is deliberately static, code-first, and light on client-side JavaScript. It uses Svelte 5, SvelteKit, mdsvex, build-time syntax highlighting, Pagefind, and Tailwind CSS. Exstream itself is bundled only on interactive example pages.

## Local development

Node.js 22 or newer is required.

```shell
npm install
npm run dev
```

Pagefind indexes the generated HTML, so search is intentionally unavailable in the normal Vite development server. To build the index and serve a searchable preview:

```shell
npm run preview:search
```

The main quality gate is:

```shell
npm test
```

It checks Svelte and TypeScript, runs the linter, creates the static site, and builds the Pagefind index.

## Content model

Documentation pages live under `src/routes/docs` as Markdown compiled by mdsvex. Each page should answer one question, start with a working example where possible, and make behavioral contracts explicit: backpressure, buffering, order, concurrency, errors, and cancellation.

The product and editorial source of truth remains the main Exstream repository:

- `README.md` for the supported public API and current positioning;
- `ROADMAP.md` for the documentation architecture and visual direction;
- `ADOPTION-ROADMAP.md` for discovery, adoption, and AI-readable documentation principles;
- `SUPPORT.md` for supported runtimes.

See [ADR 0001](docs/adr/0001-documentation-stack.md) for the stack decision.

## License

[MIT](LICENSE)
