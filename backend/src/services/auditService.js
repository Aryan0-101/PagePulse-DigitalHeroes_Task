import { isValidUrl } from '../utils/urlValidator.js';
import { InvalidUrlError } from '../utils/errors.js';
import { fetchPage } from './fetcher/index.js';
import { parseHtml } from './parser/index.js';
import { buildAuditResponse } from '../models/auditModels.js';

export async function runAudit(url) {
  if (!isValidUrl(url)) {
    throw new InvalidUrlError();
  }

  const { html, status, responseTimeMs } = await fetchPage(url);
  const parsed = parseHtml(html);

  return buildAuditResponse({ status, responseTimeMs, parsed });
}
