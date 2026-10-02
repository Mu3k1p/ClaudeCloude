import { config } from "../config";
import { tokenStore } from "../auth/tokenStore";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Optional in-process transport. When set (mock mode), requests are resolved
 * by it instead of going over the network. See src/mocks/router.ts.
 */
export type Transport = (path: string, opts: RequestOptions) => Promise<unknown>;
let transport: Transport | null = null;
export function setTransport(t: Transport | null) {
  transport = t;
}

/** Listeners notified on 401 so the auth layer can sign the user out. */
const unauthorizedListeners = new Set<() => void>();
export function onUnauthorized(fn: () => void) {
  unauthorizedListeners.add(fn);
  return () => {
    unauthorizedListeners.delete(fn);
  };
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(config.apiBaseUrl + path, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (transport) return (await transport(path, opts)) as T;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const token = tokenStore.getToken();
  if (config.authStrategy === "bearer" && token) headers.Authorization = `Bearer ${token}`;

  const profileId = tokenStore.getProfileId();
  if (profileId) headers[config.profileHeader] = profileId;

  const timeout = AbortSignal.timeout(config.requestTimeoutMs);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      credentials: config.authStrategy === "cookie" ? "include" : "same-origin",
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError" && opts.signal?.aborted) throw err;
    throw new ApiError("We couldn't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401) unauthorizedListeners.forEach((fn) => fn());
    const message =
      (data && typeof data === "object" && ("message" in data || "error" in data)
        ? String((data as { message?: unknown; error?: unknown }).message ?? (data as { error?: unknown }).error)
        : undefined) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return unwrap(data) as T;
}

/**
 * Many APIs wrap payloads as { data: ... }. Unwrap that envelope so services
 * see the payload directly. Remove this if your backend doesn't envelope.
 */
function unwrap(data: unknown): unknown {
  if (data && typeof data === "object" && !Array.isArray(data) && "data" in data) {
    const keys = Object.keys(data);
    if (keys.every((k) => ["data", "meta", "links", "success", "status"].includes(k))) {
      const d = data as { data: unknown; meta?: Record<string, unknown> };
      // Keep pagination meta alongside array payloads.
      if (Array.isArray(d.data) && d.meta) return { items: d.data, ...d.meta };
      return d.data;
    }
  }
  return data;
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
