"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldDashboardSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      router.replace("/settings");
    } catch (e) {
      // noop
    }
  }, [router]);

  return null;
}
