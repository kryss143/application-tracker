export async function fetchWithTimeoutAndRetry(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = 8000;
  const retries = 2;

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(input, { ...(init || {}), signal: controller.signal });
      clearTimeout(id);

      // Retry on 5xx server errors
      if (response.status >= 500 && attempt < retries) {
        await delay(200 * (attempt + 1));
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(id);
      const isRetryable =
        err && (err.name === "AbortError" || err.code === "ECONNRESET" || err.code === "ECONNREFUSED" || err.code === "EPIPE");
      if (attempt === retries || !isRetryable) throw err;
      await delay(200 * (attempt + 1));
    }
  }

  throw new Error("fetch failed after retries");
}

export default fetchWithTimeoutAndRetry;
