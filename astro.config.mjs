// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://onebrain.run',
  integrations: [],

  // Trim every space, newline, and HTML comment between elements in
  // the production build. Critical-chain / FCP win since the document
  // payload shrinks.
  compressHTML: true,

  build: {
    // Inline every page's CSS (~18 KiB total) into the document head
    // so there's no second round-trip for render-blocking stylesheets.
    // Lighthouse flagged ~140ms of render-block + a 189ms critical-
    // path chain caused by Layout.css and the page-level CSS file
    // both blocking first paint; inlining eliminates both. Trade-off
    // is a slightly larger HTML payload, but at <20 KiB CSS the win
    // dominates on every metric (LCP, FCP, critical-chain depth).
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});