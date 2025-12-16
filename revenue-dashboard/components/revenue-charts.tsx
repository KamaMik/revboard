"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  date: string;
  total: number;
  biliardi: number;
  bowling_time: number;
  bowling_game: number;
  bar: number;
  calcetto: number;
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Trend Incassi - Ultimi 30 Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, ""]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Totale"
                dot={{ r: 3 }}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(label) =>
                    `€${Number((label as number) ?? 0).toFixed(0)}`
                  }
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ripartizione per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) =>
                  `${name} €${Number(value).toFixed(0)} (${(
                    percent * 100
                  ).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`€${value}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Confronto Categorie - Ultimi 30 Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, ""]} />
              <Legend />
              <Bar
                dataKey="biliardi"
                stackId="a"
                fill="#3b82f6"
                name="Biliardi"
              />
              <Bar
                dataKey="bowling_time"
                stackId="a"
                fill="#10b981"
                name="Bowling Time"
              />
              <Bar
                dataKey="bowling_game"
                stackId="a"
                fill="#f59e0b"
                name="Bowling Game"
              />
              <Bar dataKey="bar" stackId="a" fill="#ef4444" name="Bar" />
              <Bar
                dataKey="calcetto"
                stackId="a"
                fill="#8b5cf6"
                name="Calcetto"
              />
              <Bar dataKey="total" fill="transparent" stroke="transparent">
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(label) =>
                    `€${Number((label as number) ?? 0).toFixed(0)}`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
