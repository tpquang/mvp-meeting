"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldDashboardRecordRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      router.replace("/record");
    } catch (e) {
      // noop
    }
  }, [router]);

  return null;
}
