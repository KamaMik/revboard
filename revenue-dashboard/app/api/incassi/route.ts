import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const categories = searchParams.get("categories")?.split(",") || [];

    let query = supabase.from("incassi").select("*");

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
    const supabase = await createClient();
    
    // Debug: Check user status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      console.log("User detected:", user.id);
      console.log("App Metadata:", user.app_metadata);
      console.log("Role:", user.role);
    } else {
      console.log("No user found in session");
    }

    const body = await request.json();

    // Check if data exists for this date
    const { data: existingData } = await supabase
      .from("incassi")
      .select("id")
      .eq("data", body.data)
      .single();

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
