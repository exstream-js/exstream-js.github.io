import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import { homeExampleCode } from '$lib/content/homeExample'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => ({
  heroCode: Prism.highlight(homeExampleCode, Prism.languages.javascript!, 'javascript'),
})
