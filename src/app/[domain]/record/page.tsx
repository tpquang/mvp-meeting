"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldDomainRecordRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect old /[domain]/record -> /record
    try {
      router.replace("/record");
    } catch (e) {
      // ignore
    }
  }, [router]);

  return null;
}
