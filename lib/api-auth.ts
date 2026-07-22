import { getCurrentUser, type UserRole } from "@/lib/auth";
import { apiError } from "@/lib/http";

export async function authenticateApiRequest(requiredRole?: UserRole) {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: apiError("Sign in to continue.", 401) } as const;
  if (requiredRole && user.role !== requiredRole) return { user: null, response: apiError("Your account does not have access to this action.", 403) } as const;
  return { user, response: null } as const;
}
