// Renders markdown written in the CMS (project sections, About story)
// with the same features as project write ups: tables, task lists,
// and math ($inline$ and $$block$$ via KaTeX). Raw HTML is not allowed.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify);
export const md = (text: string | undefined) => (text ? String(processor.processSync(text)) : '');
/** Inline markdown (for one line strings like the home statement): strips the outer <p>. */
export const mdInline = (text: string | undefined) => md(text).replace(/^<p>|<\/p>\s*$/g, '');
