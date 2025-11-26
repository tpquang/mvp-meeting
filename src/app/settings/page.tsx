"use client";

import React, { useEffect, useState } from "react";
import useRequireAuth from "@/hooks/useRequireAuth";
import { getAIConfig, DEFAULT_PROMPT, getAPIKeys, addAPIKey, removeAPIKey, getAPIKeyById, setAIConfig as persistAIConfig, testAPIKey } from "@/services/aiService";
import type { APIKeyEntry } from "@/types";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SettingsPage() {
  useRequireAuth();

  const [domain, setDomain] = useState("gpt");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [saved, setSaved] = useState(false);
  const [keys, setKeys] = useState<APIKeyEntry[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<any>("conversation");

  useEffect(() => {
    setKeys(getAPIKeys());
    // load saved AI config (if any)
    try {
      const cfg = getAIConfig();
      if (cfg) {
        setDomain(cfg.domain || "gpt");
        setPrompt(cfg.prompt || DEFAULT_PROMPT);
        setProcessingMode(cfg.processingMode || "conversation");
        setSelectedKeyId(cfg.selectedKeyId || null);
        if (cfg.selectedKeyId) {
          const k = getAPIKeyById(cfg.selectedKeyId);
          if (k) setApiKeyInput(k.key || "");
        } else {
          setApiKeyInput(cfg.apiKey || "");
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const k = getAPIKeyById(selectedKeyId);
    if (k) {
      setDomain(k.domain);
      setApiKeyInput(k.key);
    }
  }, [selectedKeyId]);

  const handleAddKey = () => {
    if (!apiKeyInput.trim()) return;
    const entry = addAPIKey({ id: makeId(), label: `Key ${new Date().toLocaleString()}`, domain, key: apiKeyInput });
    setKeys((s) => [entry, ...s]);
    setSelectedKeyId(entry.id);
    setApiKeyInput("");
  };

  const handleTestConnection = async () => {
    setTestStatus("pending");
    setTestMessage(null);
    // choose selected key if exists, otherwise use typed input
    const selectedKey = getAPIKeyById(selectedKeyId);
    const keyToTest = selectedKey ? selectedKey.key : apiKeyInput;
    const res = await testAPIKey(keyToTest || "", domain);
    if (res.ok) {
      setTestStatus("success");
      setTestMessage(res.message || "OK");
    } else {
      setTestStatus("error");
      setTestMessage(res.message || "Failed");
    }
    setTimeout(() => setTestStatus("idle"), 3000);
  };

  const handleRemoveKey = (id: string) => {
    removeAPIKey(id);
    setKeys(getAPIKeys());
    if (selectedKeyId === id) setSelectedKeyId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedKey = getAPIKeyById(selectedKeyId);
    const finalApiKey = selectedKey ? selectedKey.key : apiKeyInput;
    const cfg = { domain, apiKey: finalApiKey || "", prompt, processingMode, selectedKeyId };
    try {
      persistAIConfig(cfg as any);
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-red-600">Settings — {domain}</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-lg">
        <label className="flex flex-col">
          <span className="text-sm text-gray-800">Domain</span>
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="border px-3 py-2 rounded text-gray-800">
            <option value="gpt">ChatGPT</option>
            <option value="gemini">Gemini</option>
            <option value="grok">Grok</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-800">Chọn API key đã lưu</span>
          <div className="flex gap-2">
            <select value={selectedKeyId || ""} onChange={(e) => setSelectedKeyId(e.target.value || null)} className="border px-3 py-2 rounded flex-1 text-gray-800">
              <option value="">-- Chọn key --</option>
              {keys.map((k) => (
                <option key={k.id} value={k.id}>{`${k.label} (${k.domain})`}</option>
              ))}
            </select>
            <button type="button" onClick={() => setSelectedKeyId(null)} className="px-3 py-2 border rounded">Clear</button>
          </div>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-800">Hoặc thêm API Key mới</span>
          <input value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="Nhập API key mới" className="border px-3 py-2 rounded text-gray-800 placeholder-gray-700" />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={handleAddKey} className="px-3 py-2 rounded bg-foreground text-background">Thêm và chọn</button>
            <button type="button" onClick={handleTestConnection} className="px-3 py-2 rounded border">
              {testStatus === "pending" ? "Đang kiểm tra..." : "Test kết nối AI"}
            </button>
          </div>
          {testMessage && (
            <div className={`mt-2 text-sm ${testStatus === "success" ? "text-emerald-700" : "text-red-600"}`}>{testMessage}</div>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-800">AI xử lý (mode)</span>
          <select value={processingMode} onChange={(e) => setProcessingMode(e.target.value as any)} className="border px-3 py-2 rounded text-gray-800">
            <option value="conversation">Conversation</option>
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="summary">Summary</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-800">Prompt mặc định</span>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="border px-3 py-2 rounded min-h-[120px] text-gray-800 placeholder-gray-700" />
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded bg-foreground text-background px-4 py-2">Lưu</button>
          <button
            type="button"
            onClick={() => {
              // reset to defaults
              const cfg = { domain: "gpt", apiKey: "", prompt: DEFAULT_PROMPT, processingMode: "conversation", selectedKeyId: null };
              try {
                persistAIConfig(cfg as any);
              } catch (e) {}
              setDomain(cfg.domain);
              setApiKeyInput("");
              setPrompt(cfg.prompt);
              setProcessingMode(cfg.processingMode);
              setSelectedKeyId(null);
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
            className="rounded border px-3 py-2"
          >
            Reset về mặc định
          </button>
          {saved && <span className="text-green-600">Đã lưu</span>}
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Quản lý keys</h3>
          <ul className="mt-2 space-y-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between border p-2 rounded">
                <div>
                  <div className="text-sm font-medium">{k.label}</div>
                      <div className="text-xs text-gray-800">{k.domain} • {new Date(k.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setSelectedKeyId(k.id); setDomain(k.domain); setApiKeyInput(k.key); }} className="px-2 py-1 text-sm rounded border">Select</button>
                  <button type="button" onClick={() => handleRemoveKey(k.id)} className="px-2 py-1 text-sm rounded border text-red-600">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}
