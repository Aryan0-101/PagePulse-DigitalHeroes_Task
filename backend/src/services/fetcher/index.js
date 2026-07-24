import { TimeoutError, NonHtmlError, UnreachableError } from '../../utils/errors.js';

const TIMEOUT_MS = 8000;

export async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const startedAt = performance.now();
  let response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'PagePulseAuditBot/1.0' },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new TimeoutError();
    }
    throw new UnreachableError();
  } finally {
    clearTimeout(timeout);
  }

  const responseTimeMs = Math.round(performance.now() - startedAt);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    throw new NonHtmlError();
  }

  const html = await response.text();

  return {
    html,
    status: response.status,
    responseTimeMs,
  };
}
