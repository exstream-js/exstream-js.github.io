import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const buildDirectory = path.resolve(process.argv[2] ?? 'build')
const checkExternalLinks = process.argv.includes('--external')
const localOrigin = 'https://link-check.local'
const productionOrigin = 'https://exstream-js.github.io'
const checkedTags = new Set([
  'a',
  'area',
  'audio',
  'iframe',
  'img',
  'link',
  'script',
  'source',
  'track',
  'video',
])

const fileExistsCache = new Map()
const htmlCache = new Map()

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(entryPath)))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(entryPath)
  }

  return files
}

function pagePathForFile(file) {
  const relativePath = path.relative(buildDirectory, file).split(path.sep).join('/')
  if (relativePath === 'index.html') return '/'
  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`
  }
  return `/${relativePath}`
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function linksFromHtml(html) {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, '')
  const links = []

  for (const tagMatch of withoutComments.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)) {
    const tagName = tagMatch[1]?.toLowerCase()
    if (!tagName || !checkedTags.has(tagName)) continue

    const tag = tagMatch[0]
    for (const attribute of tag.matchAll(/\s(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
      if (attribute[2]) links.push(decodeHtml(attribute[2].trim()))
    }

    for (const attribute of tag.matchAll(/\ssrcset\s*=\s*(["'])(.*?)\1/gi)) {
      for (const candidate of attribute[2]?.split(',') ?? []) {
        const url = candidate.trim().split(/\s+/, 1)[0]
        if (url) links.push(decodeHtml(url))
      }
    }
  }

  return links
}

function linksFromMarkdown(markdown) {
  const links = []
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    if (match[1]) links.push(match[1])
  }
  return links
}

function internalUrl(rawLink, sourcePagePath) {
  if (
    !rawLink ||
    rawLink.startsWith('data:') ||
    rawLink.startsWith('mailto:') ||
    rawLink.startsWith('tel:') ||
    rawLink.startsWith('javascript:')
  ) {
    return undefined
  }

  const url = new URL(rawLink, `${localOrigin}${sourcePagePath}`)
  if (url.origin === productionOrigin) {
    return new URL(`${url.pathname}${url.search}${url.hash}`, localOrigin)
  }
  if (url.origin !== localOrigin) return undefined
  return url
}

function externalUrl(rawLink, sourcePagePath) {
  if (
    !rawLink ||
    rawLink.startsWith('data:') ||
    rawLink.startsWith('mailto:') ||
    rawLink.startsWith('tel:') ||
    rawLink.startsWith('javascript:')
  ) {
    return undefined
  }

  const url = new URL(rawLink, `${localOrigin}${sourcePagePath}`)
  if (url.origin === localOrigin || url.origin === productionOrigin) return undefined
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
  url.hash = ''
  return url
}

async function externalStatus(url) {
  const options = {
    headers: { 'user-agent': 'exstream-link-checker/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  }

  let response = await fetch(url, { ...options, method: 'HEAD' })
  if (!response.ok) response = await fetch(url, { ...options, method: 'GET' })
  await response.body?.cancel()
  return response.status
}

async function checkExternalTargets(externalTargets, failures, warnings) {
  const targets = [...externalTargets.entries()]
  let nextTarget = 0

  async function worker() {
    while (nextTarget < targets.length) {
      const [url, sourceLabel] = targets[nextTarget++]
      try {
        const status = await externalStatus(url)
        if (status === 403 || status === 429 || status >= 500) {
          warnings.push(
            `${sourceLabel}: external target could not be verified (HTTP ${status}) ${JSON.stringify(url)}`,
          )
        } else if (status >= 400) {
          failures.push(
            `${sourceLabel}: external target returned HTTP ${status} ${JSON.stringify(url)}`,
          )
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        warnings.push(
          `${sourceLabel}: could not reach external target ${JSON.stringify(url)} (${message})`,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(8, targets.length) }, () => worker()))
}

async function fileExists(file) {
  if (!fileExistsCache.has(file)) {
    fileExistsCache.set(
      file,
      stat(file)
        .then((result) => result.isFile())
        .catch(() => false),
    )
  }
  return fileExistsCache.get(file)
}

async function resolveTarget(pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const relativePath = decodedPath.replace(/^\/+/, '')
  const directTarget = path.resolve(buildDirectory, relativePath)

  if (directTarget !== buildDirectory && !directTarget.startsWith(`${buildDirectory}${path.sep}`)) {
    return undefined
  }

  const candidates = decodedPath.endsWith('/')
    ? [path.join(directTarget, 'index.html')]
    : [directTarget, path.join(directTarget, 'index.html')]

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate
  }
  return undefined
}

async function idsForHtml(file) {
  if (!htmlCache.has(file)) {
    htmlCache.set(
      file,
      readFile(file, 'utf8').then((html) => {
        const ids = new Set()
        for (const match of html.matchAll(/\s(?:id|name)\s*=\s*(["'])(.*?)\1/gi)) {
          if (match[2]) ids.add(decodeHtml(match[2]))
        }
        return ids
      }),
    )
  }
  return htmlCache.get(file)
}

async function main() {
  const htmlFiles = await collectHtmlFiles(buildDirectory)
  const failures = []
  const warnings = []
  const seen = new Set()
  const uniqueDestinations = new Set()
  const externalTargets = new Map()
  let internalLinkCount = 0

  async function checkLink(rawLink, sourcePagePath, sourceLabel) {
    const failureKey = `${sourceLabel}\0${rawLink}`
    if (seen.has(failureKey)) return
    seen.add(failureKey)

    let url
    try {
      url = internalUrl(rawLink, sourcePagePath)
    } catch {
      failures.push(`${sourceLabel}: malformed URL ${JSON.stringify(rawLink)}`)
      return
    }
    if (!url) {
      if (checkExternalLinks) {
        try {
          const external = externalUrl(rawLink, sourcePagePath)
          if (external && !externalTargets.has(external.href)) {
            externalTargets.set(external.href, sourceLabel)
          }
        } catch {
          failures.push(`${sourceLabel}: malformed URL ${JSON.stringify(rawLink)}`)
        }
      }
      return
    }

    internalLinkCount += 1
    uniqueDestinations.add(`${url.pathname}${url.hash}`)
    let targetFile
    try {
      targetFile = await resolveTarget(url.pathname)
    } catch {
      failures.push(`${sourceLabel}: malformed path ${JSON.stringify(rawLink)}`)
      return
    }

    if (!targetFile) {
      failures.push(`${sourceLabel}: missing target ${JSON.stringify(rawLink)}`)
      return
    }

    const fragment = url.hash.slice(1)
    if (!fragment || fragment.startsWith(':~:text=') || !targetFile.endsWith('.html')) return

    let decodedFragment
    try {
      decodedFragment = decodeURIComponent(fragment)
    } catch {
      failures.push(`${sourceLabel}: malformed fragment ${JSON.stringify(rawLink)}`)
      return
    }

    const ids = await idsForHtml(targetFile)
    if (!ids.has(decodedFragment)) {
      failures.push(`${sourceLabel}: missing fragment ${JSON.stringify(rawLink)}`)
    }
  }

  for (const sourceFile of htmlFiles) {
    const sourcePagePath = pagePathForFile(sourceFile)
    const sourceLabel = path.relative(buildDirectory, sourceFile)
    const html = await readFile(sourceFile, 'utf8')

    for (const rawLink of linksFromHtml(html)) {
      await checkLink(rawLink, sourcePagePath, sourceLabel)
    }
  }

  const llmsFile = path.join(buildDirectory, 'llms.txt')
  const hasLlmsFile = await fileExists(llmsFile)
  if (hasLlmsFile) {
    const sourceLabel = path.relative(buildDirectory, llmsFile)
    const markdown = await readFile(llmsFile, 'utf8')
    for (const rawLink of linksFromMarkdown(markdown)) {
      await checkLink(rawLink, '/', sourceLabel)
    }
  }

  if (checkExternalLinks) await checkExternalTargets(externalTargets, failures, warnings)

  for (const warning of warnings) console.warn(`Warning: ${warning}`)

  if (failures.length > 0) {
    console.error(`Found ${failures.length} broken link${failures.length === 1 ? '' : 's'}:`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    return
  }

  console.log(
    `Checked ${htmlFiles.length} generated HTML files${hasLlmsFile ? ' and llms.txt' : ''}: ${uniqueDestinations.size} unique internal destinations (${internalLinkCount} link references).`,
  )
  if (checkExternalLinks) {
    console.log(`Checked ${externalTargets.size} unique external destinations.`)
  }
}

await main()
