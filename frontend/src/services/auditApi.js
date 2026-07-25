const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function auditUrl(url) {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  let response;
  try {
    response = await fetch(`${cleanBaseUrl}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new Error('Could not reach the audit server.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong while auditing the page.');
  }

  return data;
}
