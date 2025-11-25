export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
}
