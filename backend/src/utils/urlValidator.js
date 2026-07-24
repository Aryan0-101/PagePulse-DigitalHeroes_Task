export function isValidUrl(candidate) {
  if (typeof candidate !== 'string' || candidate.trim() === '') {
    return false;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }

  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}
