"use client";

import { Filters, FilterState } from "@/components/filters";
import { KPICards } from "@/components/kpi-cards";
import { RevenueCharts } from "@/components/revenue-charts";
import { Revenue } from "@/lib/supabase";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const PRESET_LABELS: Record<string, string> = {
  today: "Oggi",
  last7days: "Ultimi 7 giorni",
  last30days: "Ultimi 30 giorni",
  thisMonth: "Questo mese",
  lastMonth: "Mese scorso",
  thisYear: "Questo anno",
  custom: "Periodo personalizzato",
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    categories: ["biliardi", "bowling_time", "bowling_game", "bar", "calcetto"],
    preset: "thisYear",
  });
  const [kpiData, setKpiData] = useState({
    dailyTotal: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    weeklyAverage: 0,
  });
  const [chartData, setChartData] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilteredData(filters);
  }, []);

  const loadFilteredData = async (currentFilters: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom: currentFilters.dateFrom,
        dateTo: currentFilters.dateTo,
      });
      const res = await fetch(`/api/incassi?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json?.data) {
        const data: Revenue[] = json.data;
        setChartData(data);

        const filteredData = data.map((item: Revenue) => {
          const filteredItem: any = { data: item.data };
          currentFilters.categories.forEach((category) => {
            filteredItem[category] = item[category as keyof Revenue];
          });
          filteredItem.total = currentFilters.categories.reduce(
            (sum: number, category: string) =>
              sum + (item[category as keyof Revenue] as number),
            0
          );
          return filteredItem;
        });

        // Calculate KPIs
        const total = filteredData.reduce((sum: number, item: any) => sum + item.total, 0);
        const average = total / (filteredData.length || 1);

        setKpiData({
          dailyTotal:
            filteredData.length > 0
              ? filteredData[filteredData.length - 1].total
              : 0,
          monthlyTotal: total,
          yearlyTotal: total,
          weeklyAverage: average,
        });
      }
    } catch (error) {
      console.error("Error loading filtered data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    loadFilteredData(newFilters);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analisi Dettagliata
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualizza e analizza i dati con filtri avanzati
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4 max-w-7xl">
          <div className="lg:col-span-1">
            <Filters onFiltersChange={handleFiltersChange} />
          </div>

          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-gray-500 dark:text-gray-400">
                  Caricamento...
                </div>
              </div>
            ) : (
              <>
                <KPICards data={kpiData} />
                <RevenueCharts 
                  data={chartData} 
                  activeCategories={filters.categories}
                  periodLabel={PRESET_LABELS[filters.preset] || "Periodo selezionato"}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
