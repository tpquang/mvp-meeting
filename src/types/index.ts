export type AIConfig = {
  domain: string;
  apiKey: string;
  prompt: string;
  processingMode?: "concise" | "detailed" | "summary" | "conversation";
  selectedKeyId?: string | null;
};

export type UserToken = string;

export type APIKeyEntry = {
  id: string;
  label?: string;
  domain: string; // gpt | gemini | grok
  key: string;
  createdAt: string;
};
