import { Package, Truck, Settings, LogOut, Calendar, Scan, Upload, Moon, Sun } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

const navItems = [
  { icon: Package, label: "Inventory", path: "/dashboard" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Truck, label: "Logistics", path: "/logistics" },
  { icon: Scan, label: "Smart Shelf", path: "/smart-shelf" },
  { icon: Upload, label: "Upload Data", path: "/upload-data" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { signOut } = useClerk();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-20 transition-all duration-300",
        "glass-sidebar flex flex-col items-center py-6"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 w-12 items-center justify-center mb-8 rounded-xl bg-primary/10 text-primary">
        <Package className="h-6 w-6" />
      </div>

      {/* Navigation */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 w-full space-y-3 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-105" : "group-hover:scale-110"
                    )} />

                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="ml-2 font-medium glass-tooltip border-none shadow-lg px-3 py-1.5 rounded-lg"
                  sideOffset={10}
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* Bottom Section */}
      <div className="w-full px-3 mt-auto space-y-3">
        {/* Dark Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-full aspect-square rounded-2xl text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-2 font-medium glass-tooltip border-none shadow-lg px-3 py-1.5 rounded-lg"
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </TooltipContent>
        </Tooltip>

        {/* Sign Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => signOut()}
              className="flex items-center justify-center w-full aspect-square rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-2 font-medium bg-destructive text-destructive-foreground border-none shadow-lg px-3 py-1.5 rounded-lg"
          >
            Sign Out
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};
