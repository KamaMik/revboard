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
  video_games: number;
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

export interface RevenueChartsProps {
  data: Revenue[];
  periodLabel: string;
  activeCategories: string[];
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; tremorColor: string }> = {
  biliardi: { label: "Biliardi", color: "#3b82f6", tremorColor: "blue" },
  bowling_time: { label: "Bowling Time", color: "#10b981", tremorColor: "emerald" },
  bowling_game: { label: "Bowling Game", color: "#f59e0b", tremorColor: "amber" },
  bar: { label: "Bar", color: "#ef4444", tremorColor: "pink" },
  calcetto: { label: "Calcetto", color: "#8b5cf6", tremorColor: "violet" },
  video_games: { label: "Video Games", color: "#ec4899", tremorColor: "pink" },
};

export function RevenueCharts({ data, periodLabel, activeCategories }: RevenueChartsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);

  useEffect(() => {
    if (data) {
      processData();
    }
  }, [data, activeCategories]);

  const processData = () => {
    // Process Area/Combo Chart Data
    const processedChartData = data.map((item: Revenue) => {
      const formattedItem: any = {
        date: format(new Date(item.data), "dd/MM"),
        weather_description: item.weather_description,
        weather_temperature: item.weather_temperature,
        weather_icon: item.weather_icon,
      };

      let total = 0;
      activeCategories.forEach((cat) => {
        const val = item[cat as keyof Revenue] as number;
        formattedItem[cat] = val;
        total += val;
      });
      formattedItem.total = total;

      return formattedItem as ChartData;
    });

    setChartData(processedChartData);

    // Process Pie Chart Data
    const totals = data.reduce(
      (acc: any, item: any) => {
        activeCategories.forEach((cat) => {
          acc[cat] = (acc[cat] || 0) + (item[cat as keyof Revenue] as number);
        });
        return acc;
      },
      {}
    );

    const processedPieData: PieData[] = activeCategories.map((cat) => ({
      name: CATEGORY_CONFIG[cat]?.label || cat,
      value: totals[cat] || 0,
      color: CATEGORY_CONFIG[cat]?.color || "#000000",
    }));

    setPieData(processedPieData);
  };

  const activeColors = activeCategories.map(cat => CATEGORY_CONFIG[cat]?.tremorColor || "blue");
  
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
                <span className="font-medium text-gray-900 dark:text-gray-200">
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
          <CardTitle>Trend Incassi - {periodLabel}</CardTitle>
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
            colors={activeColors as any}
            valueFormatter={(number: number) =>
              `€${Intl.NumberFormat("us").format(number).toString()}`
            }
            className="h-[200px]"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Confronto Categorie - {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <ComboChart
            data={chartData}
            index="date"
            enableBiaxial={true}
            barSeries={{
              type: "stacked",
              categories: activeCategories,
              colors: activeColors as any,
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
