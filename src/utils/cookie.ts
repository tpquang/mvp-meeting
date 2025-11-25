export function setCookie(name: string, value: string, days = 7) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  } catch (e) {
    // ignore
  }
}

export function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  } catch (e) {
    return null;
  }
}

export function deleteCookie(name: string) {
  try {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  } catch (e) {
    // ignore
  }
}
