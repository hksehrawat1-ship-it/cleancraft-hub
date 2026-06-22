import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { RoleValue } from "@/lib/roles";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      return;
    }
    (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }: any) => {
        setRoles((data ?? []).map((r: any) => r.role as RoleValue));
      });
  }, [user]);

  const isCEO = roles.includes("ceo");
  const isLeadership = isCEO || roles.includes("coo");
  return { session, user, roles, isCEO, isLeadership, loading };
}
