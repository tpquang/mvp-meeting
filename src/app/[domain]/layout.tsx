"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";

export default function DomainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="p-6">
          <div className="mx-auto w-full max-w-6xl bg-white rounded shadow-sm p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
