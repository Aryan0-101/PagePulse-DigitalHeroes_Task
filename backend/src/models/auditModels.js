export function buildAuditResponse({ status, responseTimeMs, parsed }) {
  return {
    status,
    response_time_ms: responseTimeMs,
    page_title: parsed.page_title,
    meta_description: parsed.meta_description,
    h1_count: parsed.h1_count,
    images_missing_alt: parsed.images_missing_alt,
    approximate_word_count: parsed.approximate_word_count,
  };
}

export function buildErrorResponse(message) {
  return { error: message };
}
