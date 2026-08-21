<svelte:head>
  <title>Agentic Development</title>
  <meta name="description" content="Install the Exstream pipeline skill for Codex, Claude Code, and other coding agents using the open Agent Skills format." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/project/agent-skill/" />
</svelte:head>

<p class="eyebrow">Overview · Agent tooling</p>

# Agentic Development

<p class="lead">The <code>exstream-pipelines</code> skill helps coding agents design and review Exstream pipelines using the library's actual semantics.</p>

Install it with the Vercel Labs [`skills` package](https://www.npmjs.com/package/skills):

```shell
npx skills add https://github.com/micheletriaca/exstream/tree/master/.agents/skills/exstream-pipelines
```

Installing `exstream.js` from npm installs the runtime library only; the agent skill is separate. Its source is available in the [Exstream repository](https://github.com/micheletriaca/exstream/tree/master/.agents/skills/exstream-pipelines).
