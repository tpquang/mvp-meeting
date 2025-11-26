"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { recordPath } from "@/lib/routes";
import { setToken as setClientToken } from "@/services/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const j = await res.json();
        const token = j.token as string | undefined;
        if (token) {
          // store client-side token for client auth state
          setClientToken(token);
        }
        router.push(recordPath());
      })
      .catch(() => {
        setError("Sai username hoặc password. (admin / 123)");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border px-3 py-2 rounded text-gray-800 placeholder-gray-700"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border px-3 py-2 rounded text-gray-800 placeholder-gray-700"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-red-600">{error}</div>}
          <button className="mt-2 rounded bg-foreground text-background px-4 py-2">Đăng nhập</button>
        </form>
        <div className="mt-4 text-sm text-gray-800">Dùng tạm: <strong>admin</strong> / <strong>123</strong></div>
      </div>
    </div>
  );
}
