const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

    const body = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback =
      res.status >= 500
        ? "The server is unavailable right now. Please try again in a moment."
        : "Something went wrong. Please try again.";
    throw new ApiError(res.status, body?.error ?? fallback, body?.details);
  }
  return body as T;
}