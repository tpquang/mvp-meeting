import { getItem, removeItem, setItem } from "@/utils/storage";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookie";

const TOKEN_KEY = "mvp_token";
const COOKIE_KEY = "mvp_token";

export function getToken(): string | null {
  // Prefer cookie (available to middleware) but fall back to localStorage
  try {
    const c = getCookie(COOKIE_KEY);
    if (c) return c;
  } catch (e) {
    // ignore
  }
  return getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  setItem(TOKEN_KEY, token);
  try {
    setCookie(COOKIE_KEY, token);
  } catch (e) {
    // ignore
  }
}

export function clearToken() {
  removeItem(TOKEN_KEY);
  try {
    deleteCookie(COOKIE_KEY);
  } catch (e) {
    // ignore
  }
}

export function loginService(username: string, password: string): string | null {
  // Fake auth: return a fake token if credentials match
  if (username === "admin" && password === "123") {
    const fakeToken = "mvp_fake_token_v1";
    try {
      setToken(fakeToken);
    } catch (e) {
      // ignore
    }
    return fakeToken;
  }

  return null;
}

export function logoutService() {
  try {
    clearToken();
  } catch (e) {
    // noop
  }
}
