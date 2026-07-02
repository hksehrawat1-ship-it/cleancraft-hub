import type { RoleValue } from "@/lib/roles";

// Auth removed — everyone gets full access as a mock CEO.
const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "you@cleancraftapp.com",
} as const;

const MOCK_ROLES: RoleValue[] = ["ceo"];

export function useAuth() {
  return {
    session: null as any,
    user: MOCK_USER as any,
    roles: MOCK_ROLES,
    isCEO: true,
    isLeadership: true,
    loading: false,
  };
}
