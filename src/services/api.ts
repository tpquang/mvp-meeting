import { getToken } from "@/services/auth";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...opts, headers });
  return res;
}

export default apiFetch;
