"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Inserimento Incassi Giornalieri
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="data"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Data
          </label>
          <DatePicker
            id="data"
            value={formData.data}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, data: val }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="biliardi"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Biliardi (€)
            </label>
            <Input
              id="biliardi"
              type="number"
              step="0.01"
              value={formData.biliardi}
              onChange={(e) => handleInputChange("biliardi", e.target.value)}
              className="w-full"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="bowling_time"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Bowling Time (€)
            </label>
            <Input
              id="bowling_time"
              type="number"
              step="0.01"
              value={formData.bowling_time}
              onChange={(e) =>
                handleInputChange("bowling_time", e.target.value)
              }
              className="w-full"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="bowling_game"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Bowling Game (€)
            </label>
            <Input
              id="bowling_game"
              type="number"
              step="0.01"
              value={formData.bowling_game}
              onChange={(e) =>
                handleInputChange("bowling_game", e.target.value)
              }
              className="w-full"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="bar"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Bar (€)
            </label>
            <Input
              id="bar"
              type="number"
              step="0.01"
              value={formData.bar}
              onChange={(e) => handleInputChange("bar", e.target.value)}
              className="w-full"
              min="0"
            />
          </div>

          <div>
            <label
              htmlFor="calcetto"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Calcetto (€)
            </label>
            <Input
              id="calcetto"
              type="number"
              step="0.01"
              value={formData.calcetto}
              onChange={(e) => handleInputChange("calcetto", e.target.value)}
              className="w-full"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Totale Giornaliero
              </div>
              <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                €{total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.includes("Errore")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvataggio..." : "Salva Dati"}
        </Button>
      </form>
    </div>
  );
}
