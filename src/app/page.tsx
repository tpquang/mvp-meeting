import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RECORD } from "@/lib/routes";

export default async function Home() {
  // Server-side redirect based on cookie so root always forwards appropriately
  const c = await cookies();
  const tokenCookie = c.get("mvp_token");
  const token = tokenCookie ? tokenCookie.value : null;

  if (!token) {
    return redirect("/login");
  }

  return redirect(RECORD);
}
