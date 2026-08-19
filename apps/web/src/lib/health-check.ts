import { API_BASE_URL } from '@config';

const HEALTH_URL = `${API_BASE_URL}/health`;

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function waitForApi(maxWaitMs = 10000, intervalMs = 1000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const healthy = await checkApiHealth();
    if (healthy) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}
