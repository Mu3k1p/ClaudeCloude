/** Runtime configuration, read once from public env vars. */
export const config = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""),
  authStrategy: (process.env.NEXT_PUBLIC_AUTH_STRATEGY === "cookie" ? "cookie" : "bearer") as
    | "bearer"
    | "cookie",
  profileHeader: process.env.NEXT_PUBLIC_PROFILE_HEADER || "X-Profile-Id",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Rumdul",
  imageHosts: (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean),
  requestTimeoutMs: 15000,
} as const;
