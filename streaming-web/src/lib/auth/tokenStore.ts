/**
 * Persists the session token (bearer strategy only) and the active profile id.
 * With the cookie strategy the backend owns the session and only the profile
 * id is stored here.
 */
const TOKEN_KEY = "rd.token";
const PROFILE_KEY = "rd.profile";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode); session lasts for this tab only */
  }
}

export const tokenStore = {
  getToken: () => read(TOKEN_KEY),
  setToken: (t: string | null) => write(TOKEN_KEY, t),
  getProfileId: () => read(PROFILE_KEY),
  setProfileId: (id: string | null) => write(PROFILE_KEY, id),
  clear() {
    write(TOKEN_KEY, null);
    write(PROFILE_KEY, null);
  },
};
