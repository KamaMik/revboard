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
      ];
      const categoryLabels = {
        biliardi: "Biliardi",
        bowling_time: "Bowling Time",
        bowling_game: "Bowling Game",
        bar: "Bar",
        calcetto: "Calcetto",
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Totale {periodA.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
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
            <div className="text-2xl font-bold text-green-600">
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
                  ? "text-green-600"
                  : "text-red-600"
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
                  ? "text-green-600"
                  : "text-red-600"
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, ""]} />
              <Legend />
              <Bar dataKey="periodA" fill="#3b82f6" name={periodA.label}>
                <LabelList
                  dataKey="periodA"
                  position="top"
                  formatter={(value: any) => `€${Number(value).toFixed(0)}`}
                />
              </Bar>
              <Bar dataKey="periodB" fill="#10b981" name={periodB.label}>
                <LabelList
                  dataKey="periodB"
                  position="top"
                  formatter={(value: any) => `€${Number(value).toFixed(0)}`}
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, "Differenza"]} />
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
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{item.periodA.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
