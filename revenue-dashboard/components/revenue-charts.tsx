"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { AreaChart, TooltipProps } from "@/components/tremor/areaChart";
import { DonutChart } from "@/components/tremor/dountChart";
import { ComboChart } from "@/components/tremor/comboChart";

interface ChartData {
  date: string;
  total: number;
  biliardi: number;
  bowling_time: number;
  bowling_game: number;
  bar: number;
  calcetto: number;
  weather_description?: string;
  weather_temperature?: number;
  weather_icon?: string;
}

interface PieData {
  [key: string]: string | number;
  name: string;
  value: number;
  color: string;
}

export function RevenueCharts() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const supabase = createClient();
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("incassi")
        .select("*")
        .gte("data", thirtyDaysAgo)
        .order("data", { ascending: true });

      if (error) throw error;

      if (data) {
        const chartData = data.map((item: Revenue) => ({
          date: format(new Date(item.data), "dd/MM"),
          total:
            item.biliardi +
            item.bowling_time +
            item.bowling_game +
            item.bar +
            item.calcetto,
          biliardi: item.biliardi,
          bowling_time: item.bowling_time,
          bowling_game: item.bowling_game,
          bar: item.bar,
          calcetto: item.calcetto,
        }));

        setChartData(chartData);

        // Calculate pie chart data (totals by category)
        const totals = data.reduce(
          (acc: any, item: any) => {
            acc.biliardi += item.biliardi;
            acc.bowling_time += item.bowling_time;
            acc.bowling_game += item.bowling_game;
            acc.bar += item.bar;
            acc.calcetto += item.calcetto;
            return acc;
          },
          { biliardi: 0, bowling_time: 0, bowling_game: 0, bar: 0, calcetto: 0 }
        );

        const pieData: PieData[] = [
          { name: "Biliardi", value: totals.biliardi, color: "#3b82f6" },
          {
            name: "Bowling Time",
            value: totals.bowling_time,
            color: "#10b981",
          },
          {
            name: "Bowling Game",
            value: totals.bowling_game,
            color: "#f59e0b",
          },
          { name: "Bar", value: totals.bar, color: "#ef4444" },
          { name: "Calcetto", value: totals.calcetto, color: "#8b5cf6" },
        ];

        setPieData(pieData);
      }
    } catch (error) {
      console.error("Error loading chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend Incassi - Ultimi 30 Giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-500">Caricamento...</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ripartizione per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-500">Caricamento...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-950 text-sm max-w-[250px]">
          <p className="font-medium text-gray-900 dark:text-gray-50 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
            {label}
          </p>
          
          {data.weather_description && (
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              {data.weather_icon && (
                <img 
                  src={data.weather_icon} 
                  alt={data.weather_description} 
                  className="w-8 h-8 rounded bg-gray-100"
                />
              )}
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize text-xs">
                  {data.weather_description}
                </span>
                <span className="text-xs text-gray-500">
                  {data.weather_temperature}°C
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 capitalize text-xs">
                  {item.category === "total" ? "Totale" : item.category}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  €{Intl.NumberFormat("us").format(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Trend Incassi - Ultimi 30 Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            className="h-[300px]"
            data={chartData}
            index="date"
            categories={["total"]}
            colors={["blue"]}
            valueFormatter={(number: number) =>
              `€${Intl.NumberFormat("us").format(number).toString()}`
            }
            showLegend={false}
            yAxisWidth={60}
            customTooltip={CustomTooltip}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ripartizione per Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <DonutChart
            data={pieData}
            category="name"
            value="value"
            colors={["blue", "emerald", "amber", "pink", "violet"]}
            valueFormatter={(number: number) =>
              `€${Intl.NumberFormat("us").format(number).toString()}`
            }
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Confronto Categorie - Ultimi 30 Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <ComboChart
            data={chartData}
            index="date"
            enableBiaxial={true}
            barSeries={{
              type: "stacked",
              categories: [
                "biliardi",
                "bowling_time",
                "bowling_game",
                "bar",
                "calcetto",
              ],
              colors: ["blue", "emerald", "amber", "pink", "violet"],
              valueFormatter: (number: number) =>
                `€${Intl.NumberFormat("us").format(number).toString()}`,
            }}
            lineSeries={{
              categories: ["total"],
              colors: ["gray"],
              valueFormatter: (number: number) =>
                `€${Intl.NumberFormat("us").format(number).toString()}`,
            }}
            className="h-[300px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
