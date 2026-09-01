import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disconnectObserver, observe } from './observe';

/** Polls until `condition` returns truthy (happy-dom delivers MutationObserver
 * records asynchronously, so a single rAF is not guaranteed to be enough). */
async function waitFor(condition: () => boolean, timeoutMs = 1000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('waitFor: condition never became true');
}

beforeEach(() => {
  document.body.innerHTML = '';
  disconnectObserver();
});

afterEach(() => {
  disconnectObserver();
});

describe('observe', () => {
  it('processes elements already in the DOM', async () => {
    document.body.innerHTML = '<div class="item">a</div><div class="item">b</div>';
    const render = vi.fn();
    observe('.item', render);
    await waitFor(() => render.mock.calls.length === 2);
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('processes elements added after registration', async () => {
    const render = vi.fn();
    observe('.item', render);
    await waitFor(() => render.mock.calls.length === 0); // give initial scan a beat

    const item = document.createElement('div');
    item.className = 'item';
    document.body.append(item);
    await waitFor(() => render.mock.calls.length === 1);

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith(item);
  });

  it('processes each element exactly once', async () => {
    const render = vi.fn();
    observe('.item', render);

    const item = document.createElement('div');
    item.className = 'item';
    // Append the same node twice in the same batch.
    document.body.append(item);
    document.body.append(item);
    await waitFor(() => render.mock.calls.length === 1);

    expect(render).toHaveBeenCalledTimes(1);
  });

  it('recovers when an element is replaced with a new node', async () => {
    const render = vi.fn();
    observe('.item', render);
    const first = document.createElement('div');
    first.className = 'item';
    document.body.append(first);
    await waitFor(() => render.mock.calls.length === 1);

    first.remove();
    const second = document.createElement('div');
    second.className = 'item';
    document.body.append(second);
    await waitFor(() => render.mock.calls.length === 2);

    expect(render).toHaveBeenCalledTimes(2);
  });
});