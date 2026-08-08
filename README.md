# Better ChatGPT

Sends a browser notification when ChatGPT finishes generating a response.
Notifications are only sent when the browser tab is not in focus.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. [Click here to install](https://github.com/ilyachch-userscripts/better-chatgpt/releases/latest/download/better-chatgpt.user.js).

## How it works

The script monitors the ChatGPT page for the "Stop generating" button.
When the button disappears (response complete) and the tab is not focused,
a desktop notification is sent.

## Development

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Build for production
npm run build
```

## License

Distributed under the MIT License. See `LICENSE` for more information.