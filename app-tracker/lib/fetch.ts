// Capture the native fetch implementation at module initialization.
// This prevents accidental recursion if `globalThis.fetch` is replaced later.
const nativeFetch: typeof fetch = (() => {
  try {
    const f = (globalThis as any).fetch;
    return typeof f === "function"
      ? f.bind(globalThis)
      : fetch.bind(globalThis);
  } catch {
    // Fallback to the global fetch name; if unavailable, calls will reject.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return fetch;
  }
})();

export async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const timeout = 12000;
  const retries = 3;

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const jitter = (base: number) => base + Math.floor(Math.random() * 100);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Log attempt info for debugging intermittent network issues
      // input can be a Request or URL/string — normalize for logging
      const info =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : ((input as Request).url ?? String(input));
      console.debug(`fetch attempt ${attempt + 1}/${retries + 1} -> ${info}`);
    } catch (__) {
      // ignore logging errors
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await nativeFetch(
        input as any,
        {
          ...(init || {}),
          signal: controller.signal,
        } as RequestInit,
      );
      clearTimeout(id);

      // Retry on 5xx server errors and 429 throttling
      if (
        (response.status >= 500 || response.status === 429) &&
        attempt < retries
      ) {
        console.warn(
          `fetch received ${response.status}, retrying (attempt ${attempt + 1})`,
        );
        const backoff = jitter(200 * Math.pow(2, attempt));
        await delay(backoff);
        continue;
      }

      return response;
    } catch (err: any) {
      clearTimeout(id);
      const isRetryable =
        err &&
        (err.name === "AbortError" ||
          err.code === "ECONNRESET" ||
          err.code === "ECONNREFUSED" ||
          err.code === "EPIPE");
      try {
        const info =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : ((input as Request).url ?? String(input));
        console.warn(
          `fetch error on attempt ${attempt + 1} -> ${info}:`,
          err?.message ?? err,
        );
      } catch (__) {
        // ignore logging errors
      }
      if (attempt === retries || !isRetryable) {
        console.error("fetch failed, not retrying:", err);
        throw err;
      }
      const backoff = jitter(200 * Math.pow(2, attempt));
      await delay(backoff);
    }
  }

  const msg = "fetch failed after retries";
  console.error(msg);
  throw new Error(msg);
}

export default fetchWithTimeoutAndRetry;
