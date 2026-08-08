import { GM_notification } from '$';

const POLL_INTERVAL_MS = 1000;

let isTabFocused = document.visibilityState === 'visible';
let wasGenerating = false;

function isCurrentlyGenerating(): boolean {
  return (
    document.querySelector('[data-testid="stop-button"]') !== null ||
    document.querySelector('button[aria-label="Stop streaming"]') !== null ||
    document.querySelector('button[aria-label="Stop generating"]') !== null
  );
}

function notifyFinished(): void {
  try {
    GM_notification({
      title: 'ChatGPT',
      text: 'Response generation complete',
      timeout: 5000,
    });
  } catch {
    // Fallback to Web Notification API
    if (Notification.permission === 'granted') {
      new Notification('ChatGPT', {
        body: 'Response generation complete',
      });
    }
  }
}

function requestNotificationPermission(): void {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function poll(): void {
  const generating = isCurrentlyGenerating();

  // Transition from generating to done, and tab is not focused
  if (wasGenerating && !generating && !isTabFocused) {
    notifyFinished();
  }

  wasGenerating = generating;
}

function init(): void {
  // Track tab focus via visibility API
  document.addEventListener('visibilitychange', () => {
    isTabFocused = document.visibilityState === 'visible';
  });

  // Track tab focus via window events
  window.addEventListener('focus', () => {
    isTabFocused = true;
  });
  window.addEventListener('blur', () => {
    isTabFocused = false;
  });

  // Request notification permission on first user interaction
  requestNotificationPermission();
  document.addEventListener('click', requestNotificationPermission, { once: true });

  // Initialize state
  wasGenerating = isCurrentlyGenerating();

  // Start polling
  setInterval(poll, POLL_INTERVAL_MS);
}

init();
