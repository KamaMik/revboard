
import { NextRequest, NextResponse } from "next/server";
import { getWeatherData } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time") || "12:00";
  
  try {
    let data;
    if (!date) {
      // Default to today
      const today = new Date().toISOString().split("T")[0];
      data = await getWeatherData(today, time);
    } else {
      data = await getWeatherData(date, time);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
