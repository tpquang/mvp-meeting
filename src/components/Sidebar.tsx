"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { recordPath, settingsPath } from "@/lib/routes";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { logout } = useAuth();

  const pathname = usePathname() || "/";
  const { aiConfig } = useAuth();
  const domain = aiConfig?.domain || "gpt";

  return (
    <aside className="w-64 h-screen border-r px-4 py-6 bg-white">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">MVP Meeting</h2>
      </div>
      <nav className="flex flex-col gap-2">
        <Link
          className={`px-3 py-2 rounded ${pathname.startsWith(`/record`) ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          href={recordPath()}
        >
          Ghi âm → Văn bản
        </Link>
        <Link
          className={`px-3 py-2 rounded ${pathname.startsWith(`/settings`) ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          href={settingsPath()}
        >
          Settings
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={() => logout()}
          className="w-full rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
