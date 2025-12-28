
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface LocationData {
  name: string;
  country: string;
  region: string;
  lat: string;
  lon: string;
  timezone_id: string;
  localtime: string;
}

export interface WeatherData {
  weather_temperature: number;
  weather_description: string;
  weather_icon: string;
}

export function WeatherWidget() {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather(date);
  }, [date]);

  const fetchWeather = async (selectedDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?date=${selectedDate}`);
      
      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }
      
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data && !data.error) {
          setWeather(data);
        } else {
          setError(data.error || "No data received");
          setWeather(null);
        }
      } catch (e) {
        console.error("JSON Parse Error:", text.substring(0, 100));
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full mb-8">
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mb-8 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-red-900 dark:text-red-100">
              Errore Meteo
            </CardTitle>
            <div className="w-[150px]">
              <DatePicker
                value={date}
                onChange={setDate}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="w-full mb-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <span>Meteo</span>
          </CardTitle>
          <div className="w-[180px]">
            <DatePicker
              value={date}
              onChange={setDate}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {weather.weather_icon && (
              <img
                src={weather.weather_icon}
                alt={weather.weather_description}
                className="w-16 h-16 rounded-lg shadow-sm"
              />
            )}
            <div>
              <div className="text-3xl font-bold text-blue-900 dark:text-white">
                {weather.weather_temperature}°C
              </div>
              <div className="text-blue-700 dark:text-blue-200 capitalize">
                {weather.weather_description}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
