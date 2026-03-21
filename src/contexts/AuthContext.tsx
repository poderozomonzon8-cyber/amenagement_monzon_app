import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase, supabaseSignIn, supabaseSignOut, getUserProfile } from "../lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

/* ─────────────────────────────────────────────
   Permission catalogue (unchanged)
───────────────────────────────────────────── */
export type Permission =
  | "view" | "edit" | "create" | "delete" | "approve"
  | "manage_billing" | "manage_projects" | "manage_employees" | "manage_clients"
  | "manage_leads" | "manage_analytics" | "manage_3d_assets" | "manage_appearance"
  | "manage_settings" | "manage_roles" | "manage_users";

export type Role = "admin" | "manager" | "employee" | "accountant" | "client" | "guest";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "view","edit","create","delete","approve",
    "manage_billing","manage_projects","manage_employees",
    "manage_clients","manage_leads","manage_analytics",
    "manage_3d_assets","manage_appearance","manage_settings",
    "manage_roles","manage_users",
  ],
  manager: [
    "view","edit","create","approve",
    "manage_billing","manage_projects","manage_clients","manage_leads","manage_analytics",
  ],
  employee: ["view","edit","create","manage_projects"],
  accountant: ["view","edit","create","manage_billing","manage_analytics"],
  client: ["view","approve"],
  guest: [],
};

export const ADMIN_EMAILS = ["silviolmonzon@amenagementmonzon.com"];



/* ─────────────────────────────────────────────
   Context type (updated for Supabase)
───────────────────────────────────────────── */
export type AuthContextType = {
  user: { id: string; email: string; name?: string; profilePictureUrl?: string } | null;
  isPending: boolean;
  isAnonymous: boolean;
  role: Role;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isClient: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string; profilePictureUrl?: string } | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Supabase auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { 
        id: session.user.id, 
        email: session.user.email!, 
        name: session.user.user_metadata?.name 
      } : null);
      setIsPending(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? { 
        id: session.user.id, 
        email: session.user.email!, 
        name: session.user.user_metadata?.name 
      } : null);
      setIsPending(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsPending(true);
      const { data } = await supabaseSignIn(email, password);
      if (data.user) {
        const profile = await getUserProfile(data.user.id);
        setUser({ 
          id: data.user.id, 
          email: data.user.email!, 
          name: profile?.name 
        });
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  const logout = async () => {
    const result = await supabase.auth.signOut();

    if (result?.error) {
      console.error("Logout error:", result.error);
    }

    localStorage.removeItem("user_role");
    setUser(null);
  };

  const [role, setRole] = useState<Role>("client");
  const [profile, setProfile] = useState<any>(null);
  
  const updateProfile = async (userId: string) => {
    try {
      const p = await getUserProfile(userId);
      setProfile(p);
      setRole(p?.role || "client");
    } catch {
      setRole("client");
    }
  };

  useEffect(() => {
    if (user?.id) {
      updateProfile(user.id);
    } else {
      setProfile(null);
      setRole("client");
    }
  }, [user?.id]);

  const permissions = useMemo(() => ROLE_PERMISSIONS[role] ?? [], [role]);
  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isStaff = ["admin","manager","employee","accountant"].includes(role);

  return (
    <AuthCtx.Provider value={{ 
      user, isPending, isAnonymous, role, permissions, can, isAdmin, isClient, isStaff, login, logout 
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAppAuth(): AuthContextType {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAppAuth must be used inside AuthProvider");
  return ctx;
}

export function setStoredRole(role: string) {
  localStorage.setItem("user_role", role);
}

export function getStoredRole() {
  return localStorage.getItem("user_role");
}

export function clearStoredRole() {
  localStorage.removeItem("user_role");
}

