"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldDomainSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect old /[domain]/settings -> /settings
    try {
      router.replace("/settings");
    } catch (e) {
      // ignore
    }
  }, [router]);

  return null;
}
