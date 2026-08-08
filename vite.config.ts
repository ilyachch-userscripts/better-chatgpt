import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// === Configuration ===
const SCRIPT_NAME = 'Better ChatGPT';
const NAMESPACE = 'https://github.com/ilyachch';
const MATCH_URLS = ['*://*/*'];
const ICON_URL = 'https://www.google.com/s2/favicons?sz=64&domain=github.com';
// =====================

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        fileName: 'better-chatgpt.user.js',
      },
      userscript: {
        name: SCRIPT_NAME,
        namespace: NAMESPACE,
        match: MATCH_URLS,
        icon: ICON_URL,
        description: 'Tampermonkey app',
        author: 'ilyachch',
        grant: ['GM_addStyle'],
        license: 'MIT',
        homepageURL: 'https://github.com/ilyachch-userscripts/better-chatgpt',
        supportURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/issues',
        updateURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/releases/latest/download/better-chatgpt.user.js',
        downloadURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/releases/latest/download/better-chatgpt.user.js',
        'run-at': 'document-end',
      }
    }),
  ],
});
