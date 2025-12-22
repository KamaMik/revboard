import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface SidebarRootProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarRoot = React.forwardRef<HTMLDivElement, SidebarRootProps>(
  ({ children, className }, ref) => {
    const { isOpen, setIsOpen } = useSidebar();

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex-shrink-0 group",
          className
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
    );
  }
);
SidebarRoot.displayName = "SidebarRoot";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  collapsedWidth?: string;
  expandedWidth?: string;
}

const Sidebar = React.forwardRef<HTMLAsideElement, SidebarProps>(
  (
    {
      children,
      className,
      collapsedWidth = "w-20",
      expandedWidth = "w-64",
    },
    ref
  ) => {
    const { isOpen } = useSidebar();

    return (
      <aside
        ref={ref}
        className={cn(
          "h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
          isOpen ? expandedWidth : collapsedWidth,
          className
        )}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, className }, ref) => {
    const { isOpen } = useSidebar();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center h-16 border-b dark:border-gray-700 px-4",
          className
        )}
      >
        <div
          className={cn(
            "transition-opacity duration-300 overflow-hidden whitespace-nowrap",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto px-2 py-4 space-y-2", className)}
    >
      {children}
    </div>
  )
);
SidebarContent.displayName = "SidebarContent";

interface SidebarMenuItemProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  isActive?: boolean;
}

const SidebarMenuItem = React.forwardRef<HTMLButtonElement, SidebarMenuItemProps>(
  ({ icon, label, className, isActive }, ref) => {
    const { isOpen } = useSidebar();

    return (
      <button
        ref={ref}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200",
          className
        )}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div
          className={cn(
            "transition-opacity duration-300 overflow-hidden flex-1 text-left",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {label}
        </div>
      </button>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-t dark:border-gray-700 px-2 py-4 space-y-2",
        className
      )}
    >
      {children}
    </div>
  )
);
SidebarFooter.displayName = "SidebarFooter";

interface SidebarFooterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
}

const SidebarFooterButton = React.forwardRef<
  HTMLButtonElement,
  SidebarFooterButtonProps
>(({ icon, label, className, ...props }, ref) => {
  const { isOpen } = useSidebar();

  return (
    <button
      ref={ref}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 whitespace-nowrap",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div
        className={cn(
          "transition-opacity duration-300 overflow-hidden flex-1 text-left",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      >
        {label}
      </div>
    </button>
  );
});
SidebarFooterButton.displayName = "SidebarFooterButton";

interface SidebarTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ children, className }, ref) => {
    const { isOpen, setIsOpen } = useSidebar();

    return (
      <button
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          className
        )}
      >
        {children}
      </button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

export {
  Sidebar,
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarFooter,
  SidebarFooterButton,
  SidebarTrigger,
  SidebarProvider,
  useSidebar,
};
