/**
 * Normalizes and returns the FastAPI backend microservice URL for inter-service communication.
 * Handles protocol-less hostnames (e.g. Render blueprint `property: host`), trailing slashes, and localhost fallbacks.
 */
export function getFastApiBaseUrl(): string {
  let url = (process.env.FASTAPI_BASE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':8000'))
      ? `http://${url}`
      : `https://${url}`;
  }
  return url;
}
