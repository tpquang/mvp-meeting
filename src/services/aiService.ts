import { getItem, setItem } from "@/utils/storage";
import type { AIConfig, APIKeyEntry } from "@/types";

const AI_KEY = "mvp_ai";
const API_KEYS = "mvp_api_keys";

// Default prompt used to convert speech->text into a meeting minutes summary
export const DEFAULT_PROMPT = `Bạn là một thư ký chuyên nghiệp. Nhiệm vụ của bạn là chuyển đổi nội dung văn bản (được chuyển từ giọng nói) thành biên bản họp rõ ràng, mạch lạc và dễ hiểu. Hãy thực hiện các bước sau khi tạo biên bản:
- Tóm tắt ngắn gọn (1-2 câu) về mục tiêu chính của cuộc họp.
- Liệt kê các quyết định, nhiệm vụ và người chịu trách nhiệm kèm theo ngày hoàn thành (nếu có).
- Ghi lại các điểm hành động (action items) rõ ràng.
- Nếu có các đề xuất khác nhau, tách thành mục 'Các đề xuất' và nêu ngắn mỗi đề xuất.
- Giữ ngôn ngữ trang trọng, súc tích và dễ đọc.

Bắt đầu biên bản với tiêu đề "Biên bản họp" và đóng bằng phần "Kết luận" ngắn.`;

export function getAIConfig(): AIConfig {
  const raw = getItem(AI_KEY);
  if (!raw)
    return { domain: "gpt", apiKey: "", prompt: DEFAULT_PROMPT, processingMode: "conversation", selectedKeyId: null };
  try {
    const parsed = JSON.parse(raw) as AIConfig;
    // Ensure prompt falls back to default if empty
    if (!parsed.prompt) parsed.prompt = DEFAULT_PROMPT;
    return parsed;
  } catch (e) {
    return { domain: "gpt", apiKey: "", prompt: DEFAULT_PROMPT, processingMode: "conversation", selectedKeyId: null };
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

// Quick test to validate an OpenAI-style API key by sending a small ping request.
// Returns an object with ok flag and message.
// Detect provider from explicit domain or API key prefix
function detectProvider(key?: string, domainPref?: string) {
  if (domainPref === "gemini") return "gemini";
  if (domainPref === "gpt" || domainPref === "grok") return domainPref;
  if (!key) return "openai";
  if (key.startsWith("AIza")) return "gemini"; // Google API key
  if (key.startsWith("sk-") || key.startsWith("oai-")) return "openai";
  return "openai";
}

export async function testAPIKey(key: string, domain?: string) {
  if (!key) return { ok: false, message: "No API key provided" };

  const provider = detectProvider(key, domain);
  try {
    if (provider === "gemini") {
      // Try Google Generative Language API (v1beta2) using API key as query param
      // We use text-bison-001 as a conservative default; users can change later.
      const model = "text-bison-001";
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${encodeURIComponent(
        key
      )}`;
      const body = {
        prompt: { text: "Ping" },
        maxOutputTokens: 10,
      };
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        return { ok: false, message: `HTTP ${res.status}: ${txt}` };
      }

      const j = await res.json();
      // response might contain candidates[].output or candidates[].content
      const reply = j?.candidates?.[0]?.output || j?.candidates?.[0]?.content || JSON.stringify(j).slice(0, 200);
      return { ok: true, message: String(reply).trim().slice(0, 200) };
    }

    // Default: test as OpenAI-style key
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Ping" },
        ],
        max_tokens: 5,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: `HTTP ${res.status}: ${text}` };
    }

    const j = await res.json();
    const reply = j?.choices?.[0]?.message?.content ?? "(no reply)";
    return { ok: true, message: String(reply).trim().slice(0, 200) };
  } catch (e: any) {
    return { ok: false, message: String(e?.message || e) };
  }
}

// Generate meeting minutes from a transcript using saved AI config / API key.
// Returns { ok: boolean, minutes?: string, message?: string }
export async function generateMeetingMinutes(transcript: string) {
  if (!transcript || !transcript.trim()) return { ok: false, message: "No transcript provided" };

  const cfg = getAIConfig();
  const selected = getAPIKeyById(cfg.selectedKeyId);
  const key = selected?.key || cfg.apiKey;
  if (!key) return { ok: false, message: "No API key configured. Please save an API key in Settings." };

  const prompt = cfg.prompt || DEFAULT_PROMPT;

  try {
    const provider = detectProvider(key, cfg.domain);
    if (provider === "gemini") {
      // Call Google Generative Language API (v1beta2) using API key as query param.
      // Default to text-bison-001 model; you can change this later.
      const model = "text-bison-001";
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${encodeURIComponent(
        key
      )}`;
      const body = {
        prompt: { text: `${prompt}\n\n${transcript}` },
        maxOutputTokens: 1200,
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { ok: false, message: `HTTP ${res.status}: ${txt}` };
      }
      const j = await res.json();
      const minutes = j?.candidates?.[0]?.output || j?.candidates?.[0]?.content || null;
      if (!minutes) return { ok: false, message: "No reply from AI" };
      return { ok: true, minutes: String(minutes).trim() };
    }

    // Default: OpenAI-style
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Chuyển đoạn văn sau thành biên bản họp theo hướng dẫn trên:\n${transcript}` },
        ],
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, message: `HTTP ${res.status}: ${txt}` };
    }

    const j = await res.json();
    const minutes = j?.choices?.[0]?.message?.content ?? j?.choices?.[0]?.text ?? null;
    if (!minutes) return { ok: false, message: "No reply from AI" };
    return { ok: true, minutes: String(minutes).trim() };
  } catch (e: any) {
    return { ok: false, message: String(e?.message || e) };
  }
}
