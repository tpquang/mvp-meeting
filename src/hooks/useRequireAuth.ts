"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LOGIN } from "@/lib/routes";

export default function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // replace so user can't go back to protected page
      try {
        router.replace(LOGIN);
      } catch (e) {
        // noop
      }
    }
  }, [isAuthenticated, router]);
}
