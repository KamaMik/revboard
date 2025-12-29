"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ComparisonData {
  category: string;
  categoryId: string;
  periodA: number;
  periodB: number;
  difference: number;
  percentage: number;
}

interface PeriodComparisonProps {
  periodA: { from: string; to: string; label: string };
  periodB: { from: string; to: string; label: string };
}

export function ComparisonCharts({ periodA, periodB }: PeriodComparisonProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [periodA, periodB]);

  const loadComparisonData = async () => {
    try {
      const supabase = createClient();
      // Load data for both periods
      const [dataA, dataB] = await Promise.all([
        supabase
          .from("incassi")
          .select("*")
          .gte("data", periodA.from)
          .lte("data", periodA.to),
        supabase
          .from("incassi")
          .select("*")
          .gte("data", periodB.from)
          .lte("data", periodB.to),
      ]);

      if (dataA.error || dataB.error) throw new Error("Error loading data");

      const categories = [
        "biliardi",
        "bowling_time",
        "bowling_game",
        "bar",
        "calcetto",
        "video_games",
      ];
      const categoryLabels = {
        biliardi: "Biliardi",
        bowling_time: "Bowling Time",
        bowling_game: "Bowling Game",
        bar: "Bar",
        calcetto: "Calcetto",
        video_games: "Video Games",
      };

      const categoryColors = {
        biliardi: "bg-blue-100 dark:bg-blue-900/20",
        bowling_time: "bg-emerald-100 dark:bg-emerald-900/20",
        bowling_game: "bg-amber-100 dark:bg-amber-900/20",
        bar: "bg-red-100 dark:bg-red-900/20",
        calcetto: "bg-violet-100 dark:bg-violet-900/20",
        video_games: "bg-pink-100 dark:bg-pink-900/20",
      };

      const comparisonData: ComparisonData[] = categories.map((category) => {
        const totalA =
          dataA.data?.reduce(
            (sum: number, item: any) => sum + (item[category as keyof Revenue] as number),
            0
          ) || 0;
        const totalB =
          dataB.data?.reduce(
            (sum: number, item: any) => sum + (item[category as keyof Revenue] as number),
            0
          ) || 0;
        const difference = totalA - totalB;
        const percentage = totalB !== 0 ? (difference / totalB) * 100 : 0;

        return {
          category: categoryLabels[category as keyof typeof categoryLabels],
          categoryId: category,
          periodA: totalA,
          periodB: totalB,
          difference,
          percentage,
        };
      });

      setComparisonData(comparisonData);
    } catch (error) {
      console.error("Error loading comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Confronto Periodi</CardTitle>
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-950 text-sm">
          <p className="font-medium text-gray-900 dark:text-gray-200 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 capitalize text-xs">
                  {item.name}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {item.value !== undefined ? `€${Number(item.value).toFixed(2)}` : ""}
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Totale {periodA.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              €
              {comparisonData
                .reduce((sum, item) => sum + item.periodA, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totale {periodB.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              €
              {comparisonData
                .reduce((sum, item) => sum + item.periodB, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Differenza</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                comparisonData.reduce(
                  (sum, item) => sum + item.difference,
                  0
                ) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              €
              {comparisonData
                .reduce((sum, item) => sum + item.difference, 0)
                .toFixed(2)}
            </div>
            <div
              className={`text-sm ${
                comparisonData.reduce(
                  (sum, item) => sum + item.percentage,
                  0
                ) >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {comparisonData
                .reduce((sum, item) => sum + item.percentage, 0)
                .toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Confronto per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="category" className="text-xs fill-gray-500 dark:fill-gray-200" />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-200" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="periodA" fill="#3b82f6" name={periodA.label}>
                <LabelList
                  dataKey="periodA"
                  position="top"
                  formatter={(value: any) => `€${Number(value).toFixed(0)}`}
                  className="fill-gray-900 dark:fill-gray-300 text-xs"
                />
              </Bar>
              <Bar dataKey="periodB" fill="#10b981" name={periodB.label}>
                <LabelList
                  dataKey="periodB"
                  position="top"
                  formatter={(value: any) => `€${Number(value).toFixed(0)}`}
                  className="fill-gray-900 dark:fill-gray-300 text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Difference Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Differenze per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="category" className="text-xs fill-gray-500 dark:fill-gray-200" />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-200" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="difference"
                stroke={
                  comparisonData.some((item) => item.difference < 0)
                    ? "#ef4444"
                    : "#10b981"
                }
                strokeWidth={2}
                name="Differenza"
                dot={{ r: 3 }}
              >
                <LabelList
                  dataKey="difference"
                  position="top"
                  formatter={(value: any) => `€${Number(value).toFixed(0)}`}
                  className="fill-gray-900 dark:fill-gray-300 text-xs"
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Confronto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {periodA.label}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {periodB.label}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Differenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variazione %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.map((item, index) => (
                  <tr key={index} className={
                    item.categoryId === "biliardi" ? "bg-blue-50 dark:bg-blue-900/30" :
                    item.categoryId === "bowling_time" ? "bg-emerald-50 dark:bg-emerald-900/30" :
                    item.categoryId === "bowling_game" ? "bg-amber-50 dark:bg-amber-900/30" :
                    item.categoryId === "bar" ? "bg-red-50 dark:bg-red-900/30" :
                    item.categoryId === "calcetto" ? "bg-violet-50 dark:bg-violet-900/30" :
                    item.categoryId === "video_games" ? "bg-pink-50 dark:bg-pink-900/30" : ""
                  }>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-700">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-700">
                      €{item.periodA.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-700">
                      €{item.periodB.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        item.difference >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.difference >= 0 ? "+" : ""}€
                      {item.difference.toFixed(2)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        item.percentage >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.percentage >= 0 ? "+" : ""}
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
