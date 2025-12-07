import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const { error, count } = await supabase
      .from("incassi")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      env: { hasUrl, hasAnon },
      select: { ok: !error, count: count ?? null, error: error?.message },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        env: { hasUrl, hasAnon },
        select: { ok: false, error: e?.message ?? "Unknown error" },
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  const today = format(new Date(), "yyyy-MM-dd");
  const payload = {
    data: today,
    biliardi: 0,
    bowling_time: 0,
    bowling_game: 0,
    bar: 0,
    calcetto: 0,
  };

  try {
    const { data, error } = await supabase
      .from("incassi")
      .upsert(payload, { onConflict: "data" })
      .select("id, data");

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

