import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session;
}
