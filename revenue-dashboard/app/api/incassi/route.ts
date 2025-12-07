import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const categories = searchParams.get("categories")?.split(",") || [];

    let query = (supabaseAdmin ?? supabase).from("incassi").select("*");

    if (dateFrom) {
      query = query.gte("data", dateFrom);
    }

    if (dateTo) {
      query = query.lte("data", dateTo);
    }

    query = query.order("data", { ascending: true });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if data exists for this date
    const { data: existingData } = await (supabaseAdmin ?? supabase)
      .from("incassi")
      .select("id")
      .eq("data", body.data)
      .single();

    if (existingData) {
      // Update existing record
      const { data, error } = await (supabaseAdmin ?? supabase)
        .from("incassi")
        .update(body)
        .eq("id", existingData.id)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        data,
        message: "Dati aggiornati con successo",
      });
    } else {
      // Insert new record
      const { data, error } = await (supabaseAdmin ?? supabase)
        .from("incassi")
        .insert([body])
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data, message: "Dati salvati con successo" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
