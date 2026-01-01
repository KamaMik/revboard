"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { DonutChart } from "@/components/tremor/dountChart";
import { BarList } from "@/components/tremor/barList";
import { LineChart } from "@/components/tremor/lineChart";
import { SparkAreaChart } from "@/components/tremor/sparkChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Period = "year" | "month" | "week";

interface StatData {
  period: Period;
  range: {
    from: string;
    to: string;
  };
  bestPerformance: {
    category: string;
    total: number;
  } | null;
  ranking: {
    category: string;
    total: number;
  }[];
  trend: {
    date: string;
    [key: string]: number | string;
  }[];
  debug?: any;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "year", label: "Anno" },
  { value: "month", label: "Mese" },
  { value: "week", label: "Settimana" },
];

const CATEGORY_LABELS: Record<string, string> = {
  biliardi: "Biliardi",
  bowling_time: "Bowling Time",
  bowling_game: "Bowling Game",
  bar: "Bar",
  calcetto: "Calcetto",
  video_games: "Video Games",
};

const CATEGORY_COLORS: Record<string, string> = {
  biliardi: "blue",
  bowling_time: "emerald",
  bowling_game: "amber",
  bar: "pink", // Using pink for bar based on previous files, or red? previous file said red/pink. Let's stick to what we saw.
  calcetto: "violet",
  video_games: "fuchsia", // Pink/Rose
};

// Map colors to Tremor available colors
const TREMOR_COLORS: Record<string, any> = {
  biliardi: "blue",
  bowling_time: "emerald",
  bowling_game: "amber",
  bar: "red", 
  calcetto: "violet",
  video_games: "pink",
};

export default function StatisticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period, date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/statistiche?period=${period}&date=${date}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    `€${Intl.NumberFormat("it-IT", { minimumFractionDigits: 2 }).format(value)}`;

  // Prepare data for Bar List
  const barListData = data?.ranking.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total,
    // Add href if you want to link to specific category details later
  })) || [];

  // Prepare data for Donut Chart
  const donutData = data?.ranking.map(item => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total,
    category: item.category // keep original key for color mapping if needed, but DonutChart takes 'category' prop as value key... wait.
  })) || [];

  // Prepare data for Line Chart (Trend)
  const lineChartData = data?.trend.map(item => ({
    ...item,
    date: format(new Date(item.date), "dd MMM"), // Format date for display
  })) || [];

  const lineChartCategories = Object.keys(CATEGORY_LABELS);
  const lineChartColors = lineChartCategories.map(cat => TREMOR_COLORS[cat]);

  // Helper to get spark chart data for a category
  const getSparkData = (category: string) => {
    return data?.trend.map(item => ({
      date: item.date,
      value: Number(item[category] || 0)
    })) || [];
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Statistiche Avanzate
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analisi delle performance e classifiche
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Periodo
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Data di Riferimento
            </label>
            <div className="w-[240px]">
              <DatePicker
                value={date}
                onChange={(d) => setDate(d)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500 dark:text-gray-400">
              Caricamento statistiche...
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Section: Best Performance & Donut */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Best Performance Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100">
                    Miglior Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.bestPerformance ? (
                    <div className="mt-4">
                      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium uppercase tracking-wider">
                        {CATEGORY_LABELS[data.bestPerformance.category]}
                      </p>
                      <p className="text-4xl font-bold text-blue-700 dark:text-blue-200 mt-2">
                        {formatCurrency(data.bestPerformance.total)}
                      </p>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400 mt-4">
                        Nel periodo selezionato
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nessun dato disponibile</p>
                  )}
                </CardContent>
              </Card>

              {/* Donut Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Distribuzione Incassi</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <DonutChart
                    data={donutData}
                    category="name" 
                    value="value"
                    valueFormatter={formatCurrency}
                    colors={donutData.map(d => TREMOR_COLORS[d.category] || "gray")}
                    className="h-60"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Bottom Section: Ranking Bar List */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Classifica Categorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <BarList
                      data={barListData}
                      valueFormatter={formatCurrency}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Chart Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Trend Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <LineChart
                      data={lineChartData}
                      index="date"
                      categories={lineChartCategories}
                      colors={lineChartColors}
                      valueFormatter={formatCurrency}
                      yAxisWidth={60}
                      className="h-80"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spark Charts Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const total = data?.ranking.find(r => r.category === key)?.total || 0;
                const sparkData = getSparkData(key);
                
                return (
                  <Card key={key} className="flex flex-col justify-between overflow-hidden">
                    <CardHeader className="pb-2">
                      <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
                      <div className="text-2xl font-bold">{formatCurrency(total)}</div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <SparkAreaChart
                        data={sparkData}
                        categories={["value"]}
                        index="date"
                        colors={[TREMOR_COLORS[key]]}
                        className="h-10 w-full"
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
