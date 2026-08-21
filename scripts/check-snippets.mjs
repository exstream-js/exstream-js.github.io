import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const root = process.cwd()
const supportedLanguages = new Map([
  ['js', 'javascript'],
  ['javascript', 'javascript'],
  ['mjs', 'javascript'],
  ['ts', 'typescript'],
  ['typescript', 'typescript'],
])

const relative = (file) => path.relative(root, file) || path.basename(file)

const walk = (directory, predicate) => {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(file, predicate))
    else if (predicate(file)) files.push(file)
  }
  return files
}

const markdownFiles = [
  path.join(root, 'README.md'),
  ...walk(path.join(root, 'src'), (file) => file.endsWith('.md')),
]

const executableStart =
  /^(?:await\b|async\b|class\b|const\b|export\b|for\b|function\b|if\b|import\b|let\b|new\b|try\b|var\b|while\b|exstream\s*\(|_\s*\()/

const isExecutable = (snippet) => {
  const firstLine = snippet.code
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('//'))
  if (!firstLine || firstLine.startsWith('return')) return false
  if (snippet.language === 'javascript' || snippet.embedded) return true
  if (firstLine.startsWith('function ') && !snippet.code.includes('{')) return false
  return executableStart.test(firstLine)
}

const extractMarkdownSnippets = (file) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  const snippets = []
  let fence = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!fence) {
      const match = /^```([^\s`]*)\s*$/.exec(line)
      const language = match ? supportedLanguages.get(match[1].toLowerCase()) : undefined
      if (language) fence = { code: [], language, line: index + 2 }
      continue
    }

    if (/^```\s*$/.test(line)) {
      snippets.push({ ...fence, code: fence.code.join('\n'), file })
      fence = null
    } else {
      fence.code.push(line)
    }
  }

  return snippets
}

const evaluateString = (node, environment) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isIdentifier(node)) return environment.get(node.text)
  if (ts.isParenthesizedExpression(node)) return evaluateString(node.expression, environment)
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = evaluateString(node.left, environment)
    const right = evaluateString(node.right, environment)
    return left === undefined || right === undefined ? undefined : left + right
  }
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text
    for (const span of node.templateSpans) {
      const expression = evaluateString(span.expression, environment)
      if (expression === undefined) return undefined
      value += expression + span.literal.text
    }
    return value
  }
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'replaceAll'
  ) {
    const value = evaluateString(node.expression.expression, environment)
    const search = node.arguments[0] && evaluateString(node.arguments[0], environment)
    const replacement = node.arguments[1] && evaluateString(node.arguments[1], environment)
    if (value !== undefined && search !== undefined && replacement !== undefined) {
      return value.replaceAll(search, replacement)
    }
  }
  return undefined
}

const sourceLine = (sourceFile, node) =>
  sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1

const extractEmbeddedFromSource = (file, source, selectors) => {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const environment = new Map()
  const snippets = []

  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const value = evaluateString(node.initializer, environment)
      if (value !== undefined) environment.set(node.name.text, value)
      if (selectors.variables.has(node.name.text) && value !== undefined) {
        snippets.push({
          code: value,
          embedded: true,
          file,
          language: 'javascript',
          line: sourceLine(sourceFile, node),
        })
      }
    }

    if (
      selectors.codeProperties &&
      ts.isPropertyAssignment(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'code') ||
        (ts.isStringLiteral(node.name) && node.name.text === 'code'))
    ) {
      const value = evaluateString(node.initializer, environment)
      if (value !== undefined && !value.trimStart().startsWith('<!doctype html>')) {
        snippets.push({
          code: value,
          embedded: true,
          file,
          language: 'javascript',
          line: sourceLine(sourceFile, node),
        })
      } else if (value !== undefined) {
        const moduleScript = /<script type="module">([\s\S]*?)<\/script>/.exec(value)
        if (moduleScript) {
          snippets.push({
            code: moduleScript[1],
            embedded: true,
            file,
            language: 'javascript',
            line: sourceLine(sourceFile, node),
          })
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return snippets
}

const extractEmbeddedSnippets = () => {
  const files = [
    {
      file: path.join(root, 'src/lib/content/homeExample.ts'),
      selectors: { codeProperties: false, variables: new Set(['homeExampleCode']) },
    },
    {
      file: path.join(root, 'src/lib/content/playgroundExamples.ts'),
      selectors: { codeProperties: true, variables: new Set() },
    },
    {
      file: path.join(root, 'src/lib/components/ExstreamPlayground.svelte'),
      selectors: { codeProperties: false, variables: new Set(['starterCode']) },
      svelte: true,
    },
    {
      file: path.join(root, 'src/lib/components/QuickStartTabs.svelte'),
      selectors: {
        codeProperties: true,
        variables: new Set(['pipeline', 'browserDestination']),
      },
      svelte: true,
    },
  ]

  return files.flatMap(({ file, selectors, svelte }) => {
    const contents = fs.readFileSync(file, 'utf8')
    const source = svelte
      ? /<script(?:\s+lang="ts")?>([\s\S]*?)<\/script>/.exec(contents)?.[1]
      : contents
    return source ? extractEmbeddedFromSource(file, source, selectors) : []
  })
}

const snippets = [
  ...markdownFiles.flatMap(extractMarkdownSnippets),
  ...extractEmbeddedSnippets(),
].map((snippet, index) => ({ ...snippet, id: index + 1 }))

const declarationSyntaxSource = (code) => {
  const generated = []
  const lineMap = []
  const lines = code.split('\n')
  let chunk = []
  let chunkStart = 0

  const appendChunk = () => {
    if (!chunk.length) return
    const firstLine = chunk.find((line) => line.trim())?.trim() ?? ''
    const standalone = /^(?:class|const|declare|enum|function|interface|namespace|type)\b/.test(
      firstLine,
    )
    if (!standalone) {
      generated.push('interface Snippet {')
      lineMap.push(chunkStart)
    }
    for (let index = 0; index < chunk.length; index += 1) {
      generated.push(chunk[index])
      lineMap.push(chunkStart + index)
    }
    if (!standalone) {
      generated.push('}')
      lineMap.push(chunkStart + chunk.length - 1)
    }
    chunk = []
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].trim()) {
      appendChunk()
      chunkStart = index + 1
    } else {
      if (!chunk.length) chunkStart = index
      chunk.push(lines[index])
    }
  }
  appendChunk()
  return { code: generated.join('\n'), lineMap }
}

const syntaxErrors = []
for (const snippet of snippets) {
  const executable = isExecutable(snippet)
  const kind = snippet.language === 'typescript' ? ts.ScriptKind.TS : ts.ScriptKind.JS
  const wrapAsFunction = snippet.language === 'javascript' && !executable
  const declarationSource =
    snippet.language === 'typescript' && !executable
      ? declarationSyntaxSource(snippet.code)
      : undefined
  const prefix = wrapAsFunction ? 'async function snippet() {\n' : ''
  const suffix = wrapAsFunction ? '\n}' : ''
  const source = ts.createSourceFile(
    `snippet-${snippet.id}.${snippet.language === 'typescript' ? 'ts' : 'mjs'}`,
    declarationSource?.code ?? prefix + snippet.code + suffix,
    ts.ScriptTarget.Latest,
    true,
    kind,
  )
  for (const diagnostic of source.parseDiagnostics) {
    const location = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
    const originalLine = declarationSource
      ? (declarationSource.lineMap[location.line] ?? 0)
      : Math.max(0, location.line - (prefix ? 1 : 0))
    syntaxErrors.push({
      column: location.character + 1,
      line: snippet.line + originalLine,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      snippet,
    })
  }
}

const executableSnippets = snippets.filter(
  (snippet) => snippet.language === 'typescript' && isExecutable(snippet),
)
const virtualRoot = path.join(root, '.snippet-check')

const compilerOptions = {
  allowJs: true,
  checkJs: true,
  esModuleInterop: true,
  lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  noImplicitAny: false,
  skipLibCheck: false,
  strict: true,
  target: ts.ScriptTarget.ES2023,
  types: ['node'],
  useUnknownInCatchVariables: false,
}

const siblingTypes = path.resolve(root, '../exstream/types/index.d.ts')
if (fs.existsSync(siblingTypes)) {
  compilerOptions.baseUrl = root
  compilerOptions.paths = { 'exstream.js': [siblingTypes] }
} else {
  const installedPackage = path.join(root, 'node_modules/exstream.js/package.json')
  const installedVersion = fs.existsSync(installedPackage)
    ? JSON.parse(fs.readFileSync(installedPackage, 'utf8')).version
    : undefined

  if (!installedVersion?.startsWith('1.')) {
    console.error(
      `Snippet typechecking targets Exstream 1.x, but found ${installedVersion ?? 'no installed package'}. Install the 1.0 candidate or keep its checkout next to the website.`,
    )
    process.exit(1)
  }
}

const extraGlobals = new Map(executableSnippets.map((snippet) => [snippet.id, new Map()]))

const hasExstreamBinding = (code) =>
  /\bimport\s+exstream\b/.test(code) || /\b(?:const|let|var|function|class)\s+exstream\b/.test(code)

const declarationFor = (name, code, typeOnly) => {
  if (typeOnly) return `type ${name} = any`
  if (name === '_') return `declare const _: typeof exstream`
  if (name === 'source') {
    return /\bsource\s*\(/.test(code)
      ? 'declare const source: (...args: any[]) => AsyncIterable<any> & EventTarget'
      : 'declare const source: exstream.Exstream<any>'
  }
  if (name === 'destination') {
    return /\bdestination\s*\(/.test(code)
      ? 'declare const destination: (...args: any[]) => WritableStream<any>'
      : 'declare const destination: WritableStream<any>'
  }
  const usedAsExstreamSource = new RegExp(`\\bexstream\\(\\s*${name}\\b`).test(code)
  return usedAsExstreamSource
    ? `declare const ${name}: Iterable<any>`
    : `declare const ${name}: any`
}

const virtualSources = () =>
  new Map(
    executableSnippets.map((snippet) => {
      const declarations = [...extraGlobals.get(snippet.id).values()]
      if (/\bexstream\b/.test(snippet.code) && !hasExstreamBinding(snippet.code)) {
        declarations.unshift("import exstream = require('exstream.js')")
      }
      const prelude = declarations.length ? `${declarations.join('\n')}\n` : ''
      const file = path.join(virtualRoot, `snippet-${snippet.id}.ts`)
      const code = snippet.code.replace(
        /https:\/\/cdn\.jsdelivr\.net\/npm\/exstream\.js@1\/dist\/exstream\.mjs/g,
        'exstream.js',
      )
      return [file, { preludeLines: declarations.length, snippet, source: prelude + code }]
    }),
  )

const createProgram = (sources) => {
  const host = ts.createCompilerHost(compilerOptions)
  const originalFileExists = host.fileExists.bind(host)
  const originalGetSourceFile = host.getSourceFile.bind(host)
  const originalReadFile = host.readFile.bind(host)

  host.fileExists = (file) => sources.has(path.normalize(file)) || originalFileExists(file)
  host.readFile = (file) => sources.get(path.normalize(file))?.source ?? originalReadFile(file)
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
    const virtual = sources.get(path.normalize(file))
    return virtual
      ? ts.createSourceFile(file, virtual.source, languageVersion, true, ts.ScriptKind.TS)
      : originalGetSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile)
  }

  return ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [...sources.keys()],
  })
}

let sources = virtualSources()
let program = createProgram(sources)
let diagnostics = ts.getPreEmitDiagnostics(program)

for (const diagnostic of diagnostics) {
  if (
    ![2304, 2552, 18004].includes(diagnostic.code) ||
    !diagnostic.file ||
    diagnostic.start === undefined
  ) {
    continue
  }
  const virtual = sources.get(path.normalize(diagnostic.file.fileName))
  if (!virtual) continue
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  const match =
    /Cannot find name '([^']+)'/.exec(message) ||
    /No value exists in scope for the shorthand property '([^']+)'/.exec(message)
  if (!match) continue
  const name = match[1]
  const node = findIdentifierAt(diagnostic.file, diagnostic.start)
  const typeOnly = node ? isTypePosition(node) : /^[A-Z]/.test(name)
  extraGlobals
    .get(virtual.snippet.id)
    .set(name, declarationFor(name, virtual.snippet.code, typeOnly))
}

sources = virtualSources()
program = createProgram(sources)
diagnostics = ts.getPreEmitDiagnostics(program)

const semanticErrors = diagnostics.flatMap((diagnostic) => {
  if (!diagnostic.file) return []
  const virtual = sources.get(path.normalize(diagnostic.file.fileName))
  if (!virtual) return []
  const location = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
  return [
    {
      column: location.character + 1,
      line: virtual.snippet.line + Math.max(0, location.line - virtual.preludeLines),
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      snippet: virtual.snippet,
    },
  ]
})

const errors = [...syntaxErrors, ...semanticErrors]
for (const error of errors) {
  console.error(`${relative(error.snippet.file)}:${error.line}:${error.column} ${error.message}`)
}

if (errors.length) {
  console.error(
    `Snippet check failed: ${syntaxErrors.length} syntax error(s), ${semanticErrors.length} type error(s).`,
  )
  process.exitCode = 1
} else {
  const declarationFragments = snippets.filter(
    (snippet) => snippet.language === 'typescript' && !isExecutable(snippet),
  ).length
  console.log(
    `Syntax-checked ${snippets.length} snippets; typechecked ${executableSnippets.length} complete TypeScript examples; parsed ${declarationFragments} TypeScript signature fragments in declaration context.`,
  )
}

function findIdentifierAt(sourceFile, position) {
  let found
  const visit = (node) => {
    if (position < node.getStart(sourceFile) || position >= node.getEnd()) return
    if (ts.isIdentifier(node)) found = node
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

function isTypePosition(node) {
  const parent = node.parent
  if (!parent) return false
  return (
    ts.isTypeNode(parent) ||
    ts.isTypeReferenceNode(parent) ||
    ts.isExpressionWithTypeArguments(parent) ||
    (ts.isTypeQueryNode(parent) && parent.exprName === node)
  )
}
