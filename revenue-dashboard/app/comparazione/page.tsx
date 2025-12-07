"use client";

import { ComparisonCharts } from "@/components/comparison-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useState } from "react";

export default function ComparisonPage() {
  const [periodA, setPeriodA] = useState({
    from: format(new Date(2025, 0, 1), "yyyy-MM-dd"),
    to: format(new Date(2025, 11, 31), "yyyy-MM-dd"),
    label: "Gennaio-Dicembre 2025",
  });

  const [periodB, setPeriodB] = useState({
    from: format(new Date(2024, 0, 1), "yyyy-MM-dd"),
    to: format(new Date(2024, 11, 31), "yyyy-MM-dd"),
    label: "Gennaio-Dicembre 2024",
  });

  const [showComparison, setShowComparison] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowComparison(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confronto Periodi
          </h1>
          <p className="text-gray-600">
            Confronta gli incassi tra due periodi arbitrari
          </p>
        </div>

        <div className="grid gap-8">
          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selezione Periodi</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Period A */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Periodo A
                    </h3>
                    <div>
                      <label
                        htmlFor="periodAFrom"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Dal
                      </label>
                      <DatePicker
                        id="periodAFrom"
                        value={periodA.from}
                        onChange={(val) =>
                          setPeriodA((prev) => ({ ...prev, from: val }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="periodATo"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Al
                      </label>
                      <DatePicker
                        id="periodATo"
                        value={periodA.to}
                        onChange={(val) =>
                          setPeriodA((prev) => ({ ...prev, to: val }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="periodALabel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Etichetta
                      </label>
                      <Input
                        id="periodALabel"
                        type="text"
                        value={periodA.label}
                        onChange={(e) =>
                          setPeriodA((prev) => ({
                            ...prev,
                            label: e.target.value,
                          }))
                        }
                        className="w-full"
                        placeholder="Es: Gennaio 2025"
                      />
                    </div>
                  </div>

                  {/* Period B */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Periodo B
                    </h3>
                    <div>
                      <label
                        htmlFor="periodBFrom"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Dal
                      </label>
                      <DatePicker
                        id="periodBFrom"
                        value={periodB.from}
                        onChange={(val) =>
                          setPeriodB((prev) => ({ ...prev, from: val }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="periodBTo"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Al
                      </label>
                      <DatePicker
                        id="periodBTo"
                        value={periodB.to}
                        onChange={(val) =>
                          setPeriodB((prev) => ({ ...prev, to: val }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="periodBLabel"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Etichetta
                      </label>
                      <Input
                        id="periodBLabel"
                        type="text"
                        value={periodB.label}
                        onChange={(e) =>
                          setPeriodB((prev) => ({
                            ...prev,
                            label: e.target.value,
                          }))
                        }
                        className="w-full"
                        placeholder="Es: Gennaio 2024"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  Confronta Periodi
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {showComparison && (
            <ComparisonCharts periodA={periodA} periodB={periodB} />
          )}
        </div>
      </div>
    </div>
  );
}
