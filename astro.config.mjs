import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// The site's public address. Change it if you buy a custom domain.
export default defineConfig({
  site: 'https://aliworks-umd.netlify.app',
  // $inline$ and $$block$$ math in any write up
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] },
});
