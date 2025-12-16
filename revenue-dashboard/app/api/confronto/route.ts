import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aFrom = searchParams.get("aFrom");
  const aTo = searchParams.get("aTo");
  const bFrom = searchParams.get("bFrom");
  const bTo = searchParams.get("bTo");
  const aLabel = searchParams.get("aLabel") || "Periodo A";
  const bLabel = searchParams.get("bLabel") || "Periodo B";

  if (!aFrom || !aTo || !bFrom || !bTo) {
    return NextResponse.json(
      { error: "Parametri mancanti: aFrom, aTo, bFrom, bTo" },
      { status: 400 }
    );
  }

  const client = await createClient();
  const categories = [
    "biliardi",
    "bowling_time",
    "bowling_game",
    "bar",
    "calcetto",
  ] as const;
  const labels: Record<(typeof categories)[number], string> = {
    biliardi: "Biliardi",
    bowling_time: "Bowling Time",
    bowling_game: "Bowling Game",
    bar: "Bar",
    calcetto: "Calcetto",
  };

  try {
    const [{ data: dataA, error: errorA }, { data: dataB, error: errorB }] =
      await Promise.all([
        client.from("incassi").select("*").gte("data", aFrom).lte("data", aTo),
        client.from("incassi").select("*").gte("data", bFrom).lte("data", bTo),
      ]);

    if (errorA || errorB) {
      return NextResponse.json(
        {
          error: errorA?.message || errorB?.message || "Errore nel caricamento",
        },
        { status: 400 }
      );
    }

    const sumCat = (rows: any[] | null | undefined, cat: string) =>
      (rows || []).reduce((sum, r) => sum + Number(r[cat] ?? 0), 0);

    const comparison = categories.map((cat) => {
      const totalA = sumCat(dataA, cat);
      const totalB = sumCat(dataB, cat);
      const diff = totalA - totalB;
      const pct = totalB !== 0 ? (diff / totalB) * 100 : 0;
      return {
        category: labels[cat],
        periodA: totalA,
        periodB: totalB,
        difference: diff,
        percentage: pct,
      };
    });

    const sumTotals = (rows: any[] | null | undefined) =>
      (rows || []).reduce(
        (sum, r) =>
          sum +
          Number(r.biliardi ?? 0) +
          Number(r.bowling_time ?? 0) +
          Number(r.bowling_game ?? 0) +
          Number(r.bar ?? 0) +
          Number(r.calcetto ?? 0),
        0
      );

    return NextResponse.json({
      periodA: { label: aLabel, from: aFrom, to: aTo, total: sumTotals(dataA) },
      periodB: { label: bLabel, from: bFrom, to: bTo, total: sumTotals(dataB) },
      data: comparison,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Errore sconosciuto" },
      { status: 500 }
    );
  }
}
