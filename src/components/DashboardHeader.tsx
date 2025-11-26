"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-800" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="text-gray-800 hover:underline">
            Dashboard
          </Link>
        </li>
        {parts.map((p, i) => (
          <li key={i} className="capitalize text-gray-800">
            <span className="mx-1">/</span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function DashboardHeader() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-6">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-800">Xin chào, <span className="font-medium">Admin</span></div>
        <button
          onClick={() => {
            logout();
            try {
              router.push("/login");
            } catch (e) {}
          }}
          className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
