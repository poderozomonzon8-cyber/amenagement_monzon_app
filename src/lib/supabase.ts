import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   SUPABASE CLIENT
────────────────────────────────────────────── */

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);

/* ─────────────────────────────────────────────
   LEAFLET FIX (Vite)
────────────────────────────────────────────── */

declare global {
  var __LEAFLET_ICON_URL__: string;
}

/* ─────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ContactSubmission: {
        Row: {
          name: string;
          email: string;
          phone: string | null;
          project_type: string | null;
          budget: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string | null;
          project_type?: string | null;
          budget?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          project_type?: string | null;
          budget?: string | null;
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          role: string;
          name: string | null;
          profilePictureUrl: string | null;
        };
        Insert: {
          id: string;
          role?: string;
          name?: string | null;
          profilePictureUrl?: string | null;
        };
        Update: {
          role?: string;
          name?: string | null;
          profilePictureUrl?: string | null;
        };
        Relationships: [];
      };
    };
  };
}

/* ─────────────────────────────────────────────
   GENERIC HELPERS
────────────────────────────────────────────── */

export const supabaseQuery = async (table: string) => {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return data;
};

export const supabaseMutation = async (
  table: string,
  id: string | null,
  data: any
) => {
  if (id) {
    const { error } = await supabase.from(table).update(data).eq("id", id);
    if (error) throw error;
  } else {
    const { data: newData, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return newData;
  }
};

/* ─────────────────────────────────────────────
   ⭐ USER PROFILE FETCHER (for AuthContext)
────────────────────────────────────────────── */

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, name, profilePictureUrl")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("[Supabase] getUserProfile error:", err);
    return null;
  }
}