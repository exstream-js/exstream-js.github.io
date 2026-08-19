<script lang="ts">
  import {
    autocompletion,
    closeBrackets,
    closeBracketsKeymap,
    completeFromList,
    completionKeymap,
  } from '@codemirror/autocomplete'
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
  import {
    bracketMatching,
    ensureSyntaxTree,
    HighlightStyle,
    indentOnInput,
    syntaxHighlighting,
  } from '@codemirror/language'
  import { linter, lintGutter, lintKeymap, type Diagnostic } from '@codemirror/lint'
  import {
    javascript,
    completionPath,
    localCompletionSource,
    snippets,
  } from '@codemirror/lang-javascript'
  import {
    drawSelection,
    highlightActiveLine,
    highlightActiveLineGutter,
    keymap,
    lineNumbers,
  } from '@codemirror/view'
  import { tags } from '@lezer/highlight'
  import { playgroundMethodNames } from '$lib/playgroundOperators'
  import { EditorView } from 'codemirror'
  import { onDestroy, onMount } from 'svelte'

  type Props = {
    value: string
    ariaLabel?: string
    onRun?: () => void
    onProblemsChange?: (count: number) => void
  }

  let {
    value = $bindable(),
    ariaLabel = 'JavaScript editor',
    onRun,
    onProblemsChange,
  }: Props = $props()

  let host = $state.raw<HTMLDivElement>()
  let editor = $state.raw<EditorView>()
  let lastProblemCount = -1

  const globalCompletions = [
    { label: 'exstream', type: 'function', detail: 'Create an Exstream pipeline' },
    { label: 'source', type: 'function', detail: 'Create a playground data source' },
    { label: 'destination', type: 'function', detail: 'Create a playground destination' },
    { label: 'console', type: 'variable', detail: 'Playground console' },
  ]

  const methodCompletions = playgroundMethodNames.map((label) => ({
    label,
    type: 'method',
    detail: 'Exstream operator',
  }))

  function playgroundCompletions(context: Parameters<typeof completionPath>[0]) {
    const path = completionPath(context)
    if (!path) return null

    return {
      from: context.pos - path.name.length,
      options: path.path.length > 0 ? methodCompletions : globalCompletions,
      validFor: /^\w*$/,
    }
  }

  const editorHighlighting = HighlightStyle.define([
    { tag: tags.comment, color: 'var(--pg-dim)', fontStyle: 'italic' },
    { tag: [tags.keyword, tags.modifier], color: 'var(--pg-accent)' },
    { tag: [tags.bool, tags.null, tags.number], color: 'var(--pg-purple)' },
    { tag: [tags.string, tags.special(tags.string)], color: 'var(--pg-success-ink)' },
    {
      tag: [tags.function(tags.variableName), tags.definition(tags.variableName)],
      color: 'var(--pg-ink)',
    },
    { tag: [tags.propertyName, tags.variableName], color: 'var(--pg-ink-soft)' },
    { tag: [tags.operator, tags.punctuation], color: 'var(--pg-muted)' },
    { tag: tags.invalid, color: 'var(--pg-danger-ink)', textDecoration: 'underline wavy' },
  ])

  function reportProblemCount(count: number) {
    if (count === lastProblemCount) return
    lastProblemCount = count
    onProblemsChange?.(count)
  }

  function runFromEditor() {
    onRun?.()
    return true
  }

  const syntaxLinter = linter(
    (view) => {
      const diagnostics: Diagnostic[] = []
      const tree = ensureSyntaxTree(view.state, view.state.doc.length, 100)
      if (!tree) return diagnostics

      const cursor = tree.cursor()
      do {
        if (!cursor.type.isError) continue
        const from = cursor.from
        const to = Math.max(cursor.to, Math.min(view.state.doc.length, from + 1))
        const previous = diagnostics.at(-1)
        if (previous?.from === from && previous.to === to) continue
        diagnostics.push({
          from,
          to,
          severity: 'error',
          source: 'JavaScript',
          message:
            cursor.from === cursor.to
              ? 'JavaScript syntax is incomplete here.'
              : 'Invalid JavaScript syntax.',
        })
      } while (cursor.next())

      reportProblemCount(diagnostics.length)
      return diagnostics
    },
    { delay: 400 },
  )

  const editorTheme = EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: 'var(--pg-editor)',
      color: 'var(--pg-ink)',
      fontSize: '0.78rem',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-content:focus-visible': { outline: 'none' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.65' },
    '.cm-content': { padding: '0.8rem 0' },
    '.cm-line': { padding: '0 0.8rem' },
    '.cm-gutters': {
      borderRight: '1px solid var(--pg-line-subtle)',
      backgroundColor: 'var(--pg-editor)',
      color: 'var(--pg-dim)',
    },
    '.cm-activeLine, .cm-activeLineGutter': {
      backgroundColor: 'color-mix(in srgb, var(--pg-line) 20%, transparent)',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: 'color-mix(in srgb, var(--pg-accent) 24%, transparent) !important',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--pg-accent)' },
    '.cm-tooltip': {
      border: '1px solid var(--pg-line-strong)',
      backgroundColor: 'var(--pg-panel-raised)',
      color: 'var(--pg-ink)',
    },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: 'color-mix(in srgb, var(--pg-accent) 18%, var(--pg-panel-raised))',
      color: 'var(--pg-ink)',
    },
    '.cm-completionDetail': { color: 'var(--pg-dim)' },
    '.cm-lintRange-error': {
      backgroundImage: 'none',
      textDecoration: 'underline wavy var(--pg-accent)',
    },
    '.cm-lint-marker-error': { content: '""' },
    '.cm-panels': { backgroundColor: 'var(--pg-panel)', color: 'var(--pg-ink)' },
  })

  onMount(() => {
    if (!host) return

    editor = new EditorView({
      doc: value,
      parent: host,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        keymap.of([
          { key: 'Mod-Enter', run: runFromEditor },
          { key: 'Ctrl-Enter', run: runFromEditor },
          indentWithTab,
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          ...lintKeymap,
        ]),
        javascript(),
        autocompletion({
          override: [playgroundCompletions, localCompletionSource, completeFromList(snippets)],
        }),
        syntaxHighlighting(editorHighlighting),
        syntaxLinter,
        lintGutter(),
        editorTheme,
        EditorView.contentAttributes.of({
          'aria-label': ariaLabel,
          autocapitalize: 'off',
          autocomplete: 'off',
          spellcheck: 'false',
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) value = update.state.doc.toString()
        }),
      ],
    })
  })

  $effect(() => {
    const nextValue = value
    if (!editor || editor.state.doc.toString() === nextValue) return

    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: nextValue },
    })
  })

  onDestroy(() => {
    editor?.destroy()
    reportProblemCount(0)
  })
</script>

<div class="editor-host" bind:this={host}></div>

<style>
  .editor-host {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--pg-editor);
  }

  .editor-host::after {
    position: absolute;
    z-index: 10;
    inset: 0;
    border: 2px solid transparent;
    content: '';
    pointer-events: none;
  }

  .editor-host:focus-within::after {
    border-color: var(--pg-accent);
  }

  .editor-host :global(.cm-editor) {
    min-width: 0;
  }

  .editor-host :global(.cm-scroller) {
    overflow: auto;
  }
</style>
