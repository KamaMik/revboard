import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Revenue = {
  id: string;
  data: string;
  biliardi: number;
  bowling_time: number;
  bowling_game: number;
  bar: number;
  calcetto: number;
  created_at: string;
};

export type RevenueInsert = Omit<Revenue, "id" | "created_at">;
export type RevenueUpdate = Partial<RevenueInsert>;
