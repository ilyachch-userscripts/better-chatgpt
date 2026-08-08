import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const SCRIPT_NAME = 'Better ChatGPT';
const NAMESPACE = 'https://github.com/ilyachch';
const MATCH_URLS = ['https://chatgpt.com/*', 'https://chat.openai.com/*'];
const ICON_URL = 'https://chatgpt.com/favicon.ico';

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
        description: 'Sends a browser notification when ChatGPT finishes generating a response',
        author: 'ilyachch',
        grant: ['GM_notification'],
        license: 'MIT',
        homepageURL: 'https://github.com/ilyachch-userscripts/better-chatgpt',
        supportURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/issues',
        updateURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/releases/latest/download/better-chatgpt.user.js',
        downloadURL: 'https://github.com/ilyachch-userscripts/better-chatgpt/releases/latest/download/better-chatgpt.user.js',
        'run-at': 'document-end',
      },
    }),
  ],
});
