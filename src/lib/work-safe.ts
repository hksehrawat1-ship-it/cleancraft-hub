/** Auth is mocked in this app, so protected server functions can fail with
 * "Unauthorized". Never let that crash the dashboard — fall back to empty data. */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn("[work] request failed, showing empty state:", error);
    return fallback;
  }
}
