"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldDashboardSetupRedirect() {
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
