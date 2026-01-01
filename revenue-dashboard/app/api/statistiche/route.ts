import { createClient } from "@/lib/supabase/server";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "biliardi",
  "bowling_time",
  "bowling_game",
  "bar",
  "calcetto",
  "video_games",
] as const;

type Category = (typeof CATEGORIES)[number];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";
    const dateParam = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

    const date = parseISO(dateParam);
    let from: Date;
    let to: Date;

    switch (period) {
      case "year":
        from = startOfYear(date);
        to = endOfYear(date);
        break;
      case "week":
        from = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
        to = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case "month":
      default:
        from = startOfMonth(date);
        to = endOfMonth(date);
        break;
    }

    const formattedFrom = format(from, "yyyy-MM-dd");
    const formattedTo = format(to, "yyyy-MM-dd");

    console.log(`Fetching stats for period: ${period}`);
    console.log(`Date range: ${formattedFrom} to ${formattedTo}`);

    const supabase = await createClient();
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const { data: incassi, error } = await supabase
      .from("incassi")
      .select("*")
      .gte("data", formattedFrom)
      .lte("data", formattedTo);
    
    // Debug info
    const debugInfo = {
        authenticated: !!user,
        userId: user?.id,
        queryPeriod: period,
        queryDate: dateParam,
        computedRange: { from: formattedFrom, to: formattedTo },
        recordCount: incassi?.length || 0,
        firstRecord: incassi?.[0] || null
    };

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Aggregate data
    const totals: Record<Category, number> = {
      biliardi: 0,
      bowling_time: 0,
      bowling_game: 0,
      bar: 0,
      calcetto: 0,
      video_games: 0,
    };

    const trendMap = new Map<string, Record<Category, number>>();

    incassi?.forEach((record) => {
      const dateKey = record.data; // Assuming 'data' is the date column 'yyyy-MM-dd'
      
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {
          biliardi: 0,
          bowling_time: 0,
          bowling_game: 0,
          bar: 0,
          calcetto: 0,
          video_games: 0,
        });
      }
      
      const dayStats = trendMap.get(dateKey)!;

      CATEGORIES.forEach((cat) => {
        const value = Number(record[cat] || 0);
        totals[cat] += value;
        dayStats[cat] += value;
      });
    });

    // Create trend array sorted by date
    const trend = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stats]) => ({
        date,
        ...stats
      }));

    // Create ranking
    const ranking = CATEGORIES.map((cat) => ({
      category: cat,
      total: totals[cat],
    })).sort((a, b) => b.total - a.total);

    const bestPerformance = ranking.length > 0 ? ranking[0] : null;

    return NextResponse.json({
      period,
      range: {
        from: formattedFrom,
        to: formattedTo,
      },
      bestPerformance,
      ranking,
      trend,
      debug: debugInfo
    });
  } catch (error) {
    console.error("Error in statistics API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
