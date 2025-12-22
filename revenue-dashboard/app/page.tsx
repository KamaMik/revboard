export const dynamic = "force-dynamic";

import { KPICards } from "@/components/kpi-cards";
import { RevenueCharts } from "@/components/revenue-charts";
import { RevenueForm } from "@/components/revenue-form";
import { createClient } from "@/lib/supabase/server";
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from "date-fns";

async function getDashboardData() {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
    const yearStart = format(startOfYear(new Date()), "yyyy-MM-dd");
    const yearEnd = format(endOfYear(new Date()), "yyyy-MM-dd");

    // Get today's data
    const client = await createClient();
    const { data: todayData } = await client
      .from("incassi")
      .select("*")
      .eq("data", today)
      .single();

    // Get monthly data
    const { data: monthlyData } = await client
      .from("incassi")
      .select("*")
      .gte("data", monthStart)
      .lte("data", monthEnd);

    // Get yearly data
    const { data: yearlyData } = await client
      .from("incassi")
      .select("*")
      .gte("data", yearStart)
      .lte("data", yearEnd);

    const dailyTotal = todayData
      ? todayData.biliardi +
        todayData.bowling_time +
        todayData.bowling_game +
        todayData.bar +
        todayData.calcetto
      : 0;

    const monthlyTotal =
      monthlyData?.reduce(
        (sum: number, item) =>
          sum +
          item.biliardi +
          item.bowling_time +
          item.bowling_game +
          item.bar +
          item.calcetto,
        0
      ) || 0;

    const yearlyTotal =
      yearlyData?.reduce(
        (sum: number, item) =>
          sum +
          item.biliardi +
          item.bowling_time +
          item.bowling_game +
          item.bar +
          item.calcetto,
        0
      ) || 0;

    const weeklyAverage = monthlyTotal / 30; // Approximate

    return {
      dailyTotal,
      monthlyTotal,
      yearlyTotal,
      weeklyAverage,
    };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return {
      dailyTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      weeklyAverage: 0,
    };
  }
}

export default async function DashboardPage() {
  const kpiData = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Incassi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestione e analisi degli incassi giornalieri delle attività
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl">
          <div className="lg:col-span-2 space-y-8">
            <KPICards data={kpiData} />
            <RevenueCharts />
          </div>

          <div className="lg:col-span-1">
            <RevenueForm />
          </div>
        </div>
      </div>
    </div>
  );
}
