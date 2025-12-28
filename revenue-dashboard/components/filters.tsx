"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { useState } from "react";

interface FiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  categories: string[];
  preset: string;
}

const CATEGORIES = [
  { id: "biliardi", label: "Biliardi" },
  { id: "bowling_time", label: "Bowling Time" },
  { id: "bowling_game", label: "Bowling Game" },
  { id: "bar", label: "Bar" },
  { id: "calcetto", label: "Calcetto" },
];

const PRESETS = [
  { id: "today", label: "Oggi" },
  { id: "last7days", label: "Ultimi 7 giorni" },
  { id: "last30days", label: "Ultimi 30 giorni" },
  { id: "thisMonth", label: "Questo mese" },
  { id: "lastMonth", label: "Mese scorso" },
  { id: "thisYear", label: "Questo anno" },
  { id: "custom", label: "Personalizzato" },
];

export function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    categories: CATEGORIES.map((cat) => cat.id),
    preset: "last30days",
  });

  const handlePresetChange = (preset: string) => {
    let dateFrom = "";
    let dateTo = format(new Date(), "yyyy-MM-dd");

    switch (preset) {
      case "today":
        dateFrom = format(new Date(), "yyyy-MM-dd");
        break;
      case "last7days":
        dateFrom = format(subDays(new Date(), 7), "yyyy-MM-dd");
        break;
      case "last30days":
        dateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd");
        break;
      case "thisMonth":
        dateFrom = format(startOfMonth(new Date()), "yyyy-MM-dd");
        break;
      case "lastMonth":
        dateFrom = format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
        dateTo = format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");
        break;
      case "thisYear":
        dateFrom = format(
          new Date(new Date().getFullYear(), 0, 1),
          "yyyy-MM-dd"
        );
        break;
    }

    const newFilters = { ...filters, dateFrom, dateTo, preset };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (field: "dateFrom" | "dateTo", value: string) => {
    const newFilters = { ...filters, [field]: value, preset: "custom" };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300 text-gray-800 space-y-6 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtri</h3>

        {/* Date Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Periodo Predefinito
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                className={
                  filters.preset === preset.id
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                }
                onClick={() => handlePresetChange(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dal
            </label>
            <DatePicker
              id="dateFrom"
              value={filters.dateFrom}
              onChange={(val) => handleDateChange("dateFrom", val)}
            />
          </div>
          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Al
            </label>
            <DatePicker
              id="dateTo"
              value={filters.dateTo}
              onChange={(val) => handleDateChange("dateTo", val)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorie
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CATEGORIES.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="mr-2"
                />
                <span className="text-sm">{category.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
