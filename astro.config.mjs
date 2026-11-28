import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHidePlaceholders from './src/lib/hide-placeholders.mjs';

// The site's public address. Change it if you buy a custom domain.
export default defineConfig({
  site: 'https://aliworks-umd.pages.dev',
  // $inline$ and $$block$$ math in any write up
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex, rehypeHidePlaceholders] },
  // PLACEHOLDER notes are cut from every page at build time (src/lib/hide-placeholders.mjs)
});
