export const HOME = "/";
export const LOGIN = "/login";

// Keep defaultDomain for backward compatibility if other code relies on it
export const defaultDomain = "gpt";

// Top-level routes (no domain prefix)
export const RECORD = "/record";
export const SETTING = "/settings";

// Helper functions kept for compatibility — they currently ignore domain
export function recordPath() {
  return RECORD;
}

export function settingsPath() {
  return SETTING;
}

const ROUTES = { HOME, LOGIN, RECORD, SETTING, recordPath, settingsPath, defaultDomain } as const;
export default ROUTES;
