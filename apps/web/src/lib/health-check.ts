export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
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
