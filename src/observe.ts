/**
 * Shared DOM observer.
 *
 * Watches for elements matching a selector and calls a renderer for each one,
 * exactly once per element. Works with GitHub's client-side rendering:
 * newly inserted nodes are scanned, and elements that React recreates on
 * navigation are processed again (their previous marker is gone).
 *
 * Processing is batched through `requestAnimationFrame` so bursts of DOM
 * changes (infinite scroll, tree expansion) stay cheap.
 */

type EntryRenderer = (element: Element) => void;

interface Entry {
  selector: string;
  render: EntryRenderer;
}

interface Queued {
  entry: Entry;
  element: Element;
}

const entries: Entry[] = [];
const seen = new WeakMap<Entry, WeakSet<Element>>();
let queue: Queued[] = [];
let rafId = 0;
let observer: MutationObserver | undefined;

/** Registers a selector/renderer pair. Safe to call multiple times. */
export function observe(selector: string, render: EntryRenderer): void {
  const entry: Entry = { selector, render };
  const processed = new WeakSet<Element>();
  entries.push(entry);
  seen.set(entry, processed);

  for (const element of document.querySelectorAll<Element>(selector)) {
    if (!processed.has(element)) {
      processed.add(element);
      queue.push({ entry, element });
    }
  }

  schedule();

  if (!observer) {
    observer = new MutationObserver(handleMutations);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

function handleMutations(mutations: MutationRecord[]): void {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) {
        continue;
      }
      for (const entry of entries) {
        const processed = seen.get(entry)!;
        if (node.matches(entry.selector) && !processed.has(node)) {
          processed.add(node);
          queue.push({ entry, element: node });
        }
        for (const element of node.querySelectorAll<Element>(entry.selector)) {
          if (!processed.has(element)) {
            processed.add(element);
            queue.push({ entry, element });
          }
        }
      }
    }
  }
  schedule();
}

function schedule(): void {
  if (rafId) {
    return;
  }
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    const batch = queue;
    queue = [];
    for (const { entry, element } of batch) {
      try {
        entry.render(element);
      } catch (error) {
        // A renderer failure must never break the observer or the page.
        console.error('[seti-icons] failed to render icon:', error);
      }
    }
  });
}

// Fallback for test environments that lack requestAnimationFrame.
if (typeof requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    setTimeout(() => callback(performance.now()), 0) as unknown as number;
}

/** Tears down the observer (e.g. on extension context invalidation). */
export function disconnectObserver(): void {
  observer?.disconnect();
  observer = undefined;
  entries.length = 0;
  queue = [];
}