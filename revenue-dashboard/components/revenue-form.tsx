"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RevenueInsert } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface RevenueFormProps {
  onSuccess?: () => void;
  selectedDate?: string;
}

export function RevenueForm({ onSuccess, selectedDate }: RevenueFormProps) {
  const [formData, setFormData] = useState<RevenueInsert>({
    data: selectedDate || format(new Date(), "yyyy-MM-dd"),
    biliardi: 0,
    bowling_time: 0,
    bowling_game: 0,
    bar: 0,
    calcetto: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (selectedDate) {
      loadExistingData(selectedDate);
    }
  }, [selectedDate]);

  const loadExistingData = async (date: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("incassi")
        .select("*")
        .eq("data", date)
        .single();

      if (data && !error) {
        setFormData({
          data: data.data,
          biliardi: data.biliardi,
          bowling_time: data.bowling_time,
          bowling_game: data.bowling_game,
          bar: data.bar,
          calcetto: data.calcetto,
        });
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/incassi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Errore nel salvataggio dei dati");
      }

      setMessage(json?.message || "Dati salvati con successo!");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage(
        error instanceof Error ? error.message : "Errore nel salvataggio dei dati"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof Omit<RevenueInsert, "data">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const total =
    formData.biliardi +
    formData.bowling_time +
    formData.bowling_game +
    formData.bar +
    formData.calcetto;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Inserimento Incassi Giornalieri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <DatePicker
              id="data"
              value={formData.data}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, data: val }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="biliardi">Biliardi (€)</Label>
              <Input
                id="biliardi"
                type="number"
                step="0.01"
                value={formData.biliardi || ""}
                onChange={(e) => handleInputChange("biliardi", e.target.value)}
                className="w-full"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bowling_time">Bowling Time (€)</Label>
              <Input
                id="bowling_time"
                type="number"
                step="0.01"
                value={formData.bowling_time || ""}
                onChange={(e) =>
                  handleInputChange("bowling_time", e.target.value)
                }
                className="w-full"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bowling_game">Bowling Game (€)</Label>
              <Input
                id="bowling_game"
                type="number"
                step="0.01"
                value={formData.bowling_game || ""}
                onChange={(e) =>
                  handleInputChange("bowling_game", e.target.value)
                }
                className="w-full"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bar">Bar (€)</Label>
              <Input
                id="bar"
                type="number"
                step="0.01"
                value={formData.bar || ""}
                onChange={(e) => handleInputChange("bar", e.target.value)}
                className="w-full"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calcetto">Calcetto (€)</Label>
              <Input
                id="calcetto"
                type="number"
                step="0.01"
                value={formData.calcetto || ""}
                onChange={(e) => handleInputChange("calcetto", e.target.value)}
                className="w-full"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Totale Giornaliero
                </span>
                <span className="text-2xl font-bold text-green-500 dark:text-green-400">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes("Errore")
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Salvataggio..." : "Salva Dati"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
