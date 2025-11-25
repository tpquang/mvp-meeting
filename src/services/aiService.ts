import { getItem, setItem } from "@/utils/storage";
import type { AIConfig, APIKeyEntry } from "@/types";

const AI_KEY = "mvp_ai";
const API_KEYS = "mvp_api_keys";

export function getAIConfig(): AIConfig {
  const raw = getItem(AI_KEY);
  if (!raw) return { domain: "gpt", apiKey: "", prompt: "", processingMode: "conversation", selectedKeyId: null };
  try {
    return JSON.parse(raw) as AIConfig;
  } catch (e) {
    return { domain: "gpt", apiKey: "", prompt: "", processingMode: "conversation", selectedKeyId: null };
  }
}

export function setAIConfig(c: AIConfig) {
  setItem(AI_KEY, JSON.stringify(c));
}

export function getAPIKeys(): APIKeyEntry[] {
  const raw = getItem(API_KEYS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as APIKeyEntry[];
  } catch (e) {
    return [];
  }
}

export function addAPIKey(entry: Omit<APIKeyEntry, "createdAt">) {
  const list = getAPIKeys();
  const withMeta: APIKeyEntry = { ...entry, createdAt: new Date().toISOString() };
  list.unshift(withMeta);
  setItem(API_KEYS, JSON.stringify(list));
  return withMeta;
}

export function removeAPIKey(id: string) {
  const list = getAPIKeys().filter((k) => k.id !== id);
  setItem(API_KEYS, JSON.stringify(list));
}

export function getAPIKeyById(id?: string | null) {
  if (!id) return null;
  return getAPIKeys().find((k) => k.id === id) || null;
}
