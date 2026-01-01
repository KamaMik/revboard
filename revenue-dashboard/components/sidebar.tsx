"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  Sidebar,
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarFooter,
  SidebarFooterButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { BarChart3, LogOut, Moon, Sun, TrendingUp, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Analisi", href: "/analytics", icon: TrendingUp },
  { name: "Confronto", href: "/comparazione", icon: PlusCircle },
  { name: "Statistiche", href: "/statistiche", icon: BarChart3 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <SidebarRoot>
        <Sidebar>
          <SidebarHeader>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              Revenue
            </h1>
          </SidebarHeader>

          <SidebarContent>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block"
                >
                  <SidebarMenuItem
                    icon={<Icon className="h-5 w-5" />}
                    label={item.name}
                    isActive={isActive}
                  />
                </Link>
              );
            })}
          </SidebarContent>

          <SidebarFooter>
            <SidebarFooterButton
              icon={
                theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )
              }
              label={theme === "light" ? "Dark Mode" : "Light Mode"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            />
            <SidebarFooterButton
              icon={<LogOut className="h-5 w-5" />}
              label="Esci"
              onClick={() => signOut()}
            />
          </SidebarFooter>
        </Sidebar>
      </SidebarRoot>
    </SidebarProvider>
  );
}
