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
    video_games: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");

  useEffect(() => {
    if (formData.data) {
      handleDateTimeChange(formData.data, selectedTime);
    }
  }, [formData.data, selectedTime]);

  const handleDateTimeChange = async (date: string, time: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("incassi")
        .select("*")
        .eq("data", date)
        .maybeSingle();

      if (data && !error) {
        setFormData({
          data: data.data,
          biliardi: data.biliardi,
          bowling_time: data.bowling_time,
          bowling_game: data.bowling_game,
          bar: data.bar,
          calcetto: data.calcetto,
          video_games: data.video_games || 0,
          weather_temperature: data.weather_temperature,
          weather_description: data.weather_description,
          weather_icon: data.weather_icon,
        });
        // If data exists, we might want to keep the selected time or reset it?
        // For now, let's keep the user selected time to allow re-fetching weather if they want.
      } else {
        // No data found for this date, fetch weather and reset fields
        const weatherRes = await fetch(`/api/weather?date=${date}&time=${time}`);
        const weatherData = await weatherRes.json();
        
        setFormData(prev => ({
          ...prev,
          data: date,
          biliardi: 0,
          bowling_time: 0,
          bowling_game: 0,
          bar: 0,
          calcetto: 0,
          video_games: 0,
          weather_temperature: weatherData?.weather_temperature,
          weather_description: weatherData?.weather_description,
          weather_icon: weatherData?.weather_icon,
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadExistingData = async (date: string) => {
    // Kept for backward compatibility if needed, but handleDateTimeChange covers it
    handleDateTimeChange(date, selectedTime);
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
    formData.calcetto +
    (formData.video_games || 0);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Inserimento Incassi Giornalieri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="data">Data</Label>
              <DatePicker
                id="data"
                value={formData.data}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, data: val }))
                }
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="time">Ora</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.weather_description && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="space-y-2">
                   <Label htmlFor="weather_description">Meteo</Label>
                   <div className="flex gap-2">
                     {formData.weather_icon && (
                        <img 
                          src={formData.weather_icon} 
                          alt={formData.weather_description}
                          className="w-10 h-10 rounded self-center"
                        />
                     )}
                     <Input 
                        id="weather_description"
                        value={formData.weather_description}
                        onChange={(e) => setFormData(prev => ({...prev, weather_description: e.target.value}))}
                        className="flex-1"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="weather_temperature">Temperatura (°C)</Label>
                   <Input 
                      id="weather_temperature"
                      type="number"
                      step="0.1"
                      value={formData.weather_temperature}
                      onChange={(e) => setFormData(prev => ({...prev, weather_temperature: parseFloat(e.target.value) || 0}))}
                   />
                </div>
              </div>
            )}
            
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
              <Label htmlFor="video_games">Video Games (€)</Label>
              <Input
                id="video_games"
                type="number"
                step="0.01"
                value={formData.video_games || ""}
                onChange={(e) => handleInputChange("video_games", e.target.value)}
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
