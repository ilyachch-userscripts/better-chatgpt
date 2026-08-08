import { GM_notification } from '$';
import './style.css';

const POLL_INTERVAL_MS = 1000;
const PREVIEW_MAX_LENGTH = 120;
const TIMER_FINAL_DISPLAY_MS = 8000;
const NOTIFICATION_TIMEOUT_MS = 7000;

let isTabFocused = document.visibilityState === 'visible';
let wasGenerating = false;
let generationStartTime: number | null = null;
let timerElement: HTMLDivElement | null = null;
let timerHideTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Detection ──────────────────────────────────────────────────────────

function isCurrentlyGenerating(): boolean {
  return (
    document.querySelector('[data-testid="stop-button"]') !== null ||
    document.querySelector('button[aria-label="Stop streaming"]') !== null ||
    document.querySelector('button[aria-label="Stop generating"]') !== null
  );
}

// ── Assistant message ──────────────────────────────────────────────────

function getLastAssistantText(): string {
  const messages = document.querySelectorAll(
    '[data-message-author-role="assistant"]'
  );
  if (messages.length === 0) return '';

  const lastMessage = messages[messages.length - 1];
  const text = lastMessage.textContent?.trim() || '';
  if (text.length <= PREVIEW_MAX_LENGTH) return text;

  return text.slice(0, PREVIEW_MAX_LENGTH) + '…';
}

// ── Timer formatting ───────────────────────────────────────────────────

function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${seconds}s`;
}

// ── Floating timer UI ──────────────────────────────────────────────────

function ensureTimerElement(): HTMLDivElement {
  if (!timerElement) {
    timerElement = document.createElement('div');
    timerElement.id = 'better-chatgpt-timer';
    document.body.appendChild(timerElement);
  }
  return timerElement;
}

function showTimer(text: string): void {
  const el = ensureTimerElement();
  el.textContent = text;
  el.classList.add('visible');

  if (timerHideTimeout) {
    clearTimeout(timerHideTimeout);
    timerHideTimeout = null;
  }
}

function hideTimerAfterDelay(): void {
  if (timerHideTimeout) clearTimeout(timerHideTimeout);
  timerHideTimeout = setTimeout(() => {
    if (timerElement) {
      timerElement.classList.remove('visible');
    }
    timerHideTimeout = null;
  }, TIMER_FINAL_DISPLAY_MS);
}

function updateRunningTimer(): void {
  if (!generationStartTime || !timerElement) return;
  const elapsed = Date.now() - generationStartTime;
  timerElement.textContent = formatElapsed(elapsed);
}

// ── Notifications ──────────────────────────────────────────────────────

function buildNotificationText(elapsedMs: number): string {
  const preview = getLastAssistantText();
  const time = formatElapsed(elapsedMs);
  let text = `Done in ${time}`;
  if (preview) {
    text += `\n\n${preview}`;
  }
  return text;
}

function notifyFinished(): void {
  const elapsedMs = generationStartTime
    ? Date.now() - generationStartTime
    : 0;
  const text = buildNotificationText(elapsedMs);

  try {
    GM_notification({
      title: 'ChatGPT',
      text,
      timeout: NOTIFICATION_TIMEOUT_MS,
    });
  } catch {
    if (Notification.permission === 'granted') {
      new Notification('ChatGPT', {
        body: text,
      });
    }
  }
}

function requestNotificationPermission(): void {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Copy last response ─────────────────────────────────────────────────

function hasEditableFocus(): boolean {
  const activeElement = document.activeElement as HTMLElement | null;
  if (!activeElement) return false;
  if (activeElement.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
}

async function copyLastResponse(): Promise<void> {
  const fullText = getFullAssistantText();
  if (!fullText) return;

  try {
    await navigator.clipboard.writeText(fullText);
    showCopyFeedback();
  } catch {
    // Clipboard write failed silently
  }
}

function getFullAssistantText(): string {
  const messages = document.querySelectorAll(
    '[data-message-author-role="assistant"]'
  );
  if (messages.length === 0) return '';

  const lastMessage = messages[messages.length - 1];
  return lastMessage.textContent?.trim() || '';
}

function showCopyFeedback(): void {
  const el = ensureTimerElement();
  const prevText = el.textContent;
  el.textContent = '✓ Copied';
  el.classList.add('visible');

  setTimeout(() => {
    el.textContent = prevText;
    if (!generationStartTime && !timerHideTimeout) {
      el.classList.remove('visible');
    }
  }, 1500);
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (event) => {
    if (hasEditableFocus()) return;

    // Ctrl+Alt+C — copy last assistant response
    if (event.ctrlKey && event.altKey && event.code === 'KeyC') {
      event.preventDefault();
      copyLastResponse();
    }
  });
}

// ── Main poll loop ─────────────────────────────────────────────────────

function poll(): void {
  const generating = isCurrentlyGenerating();

  // Generation just started
  if (!wasGenerating && generating) {
    generationStartTime = Date.now();
    showTimer('0.0s');
  }

  // Generation running — update timer
  if (generating && generationStartTime) {
    updateRunningTimer();
  }

  // Generation finished
  if (wasGenerating && !generating) {
    const elapsedMs = generationStartTime
      ? Date.now() - generationStartTime
      : 0;

    // Show final time in the timer UI
    showTimer(formatElapsed(elapsedMs));
    hideTimerAfterDelay();

    // Notify only when tab is not focused
    if (!isTabFocused) {
      notifyFinished();
    }

    generationStartTime = null;
  }

  wasGenerating = generating;
}

// ── Init ───────────────────────────────────────────────────────────────

function init(): void {
  document.addEventListener('visibilitychange', () => {
    isTabFocused = document.visibilityState === 'visible';
  });

  window.addEventListener('focus', () => {
    isTabFocused = true;
  });
  window.addEventListener('blur', () => {
    isTabFocused = false;
  });

  requestNotificationPermission();
  document.addEventListener('click', requestNotificationPermission, { once: true });

  setupKeyboardShortcuts();

  wasGenerating = isCurrentlyGenerating();
  if (wasGenerating) {
    generationStartTime = Date.now();
    showTimer('0.0s');
  }

  setInterval(poll, POLL_INTERVAL_MS);
}

init();