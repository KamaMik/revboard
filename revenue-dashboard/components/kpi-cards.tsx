import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon?: React.ReactNode;
}

function KPICard({ title, value, change, changeType, icon }: KPICardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-xl md:text-2xl font-bold truncate" title={value}>
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center text-[10px] md:text-xs mt-1 ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "positive" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KPICardsProps {
  data: {
    dailyTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    weeklyAverage: number;
  };
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Totale Giornaliero"
        value={`€${data.dailyTotal.toFixed(2)}`}
        change="+12% vs ieri"
        changeType="positive"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <KPICard
        title="Media Settimanale"
        value={`€${data.weeklyAverage.toFixed(2)}`}
        change="+5% vs settimana scorsa"
        changeType="positive"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <KPICard
        title="Totale Mensile"
        value={`€${data.monthlyTotal.toFixed(2)}`}
        change="+8% vs mese scorso"
        changeType="positive"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      <KPICard
        title="Totale Annuale"
        value={`€${data.yearlyTotal.toFixed(2)}`}
        change="+15% vs anno scorso"
        changeType="positive"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
