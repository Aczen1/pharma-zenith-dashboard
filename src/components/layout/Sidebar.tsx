import { Package, ShoppingCart, Truck, Settings, LogOut, PanelLeftClose, PanelLeft, Calendar } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: Package, label: "Inventory", path: "/dashboard" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Truck, label: "Logistics", path: "/logistics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { signOut } = useClerk();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-20 transition-all duration-300",
        "bg-white border-r border-gray-100 flex flex-col items-center py-6"
      )}
    >
      {/* Logo */}
      <div className="flex h-12 w-12 items-center justify-center mb-8 rounded-xl bg-indigo-50 text-indigo-600">
        <Package className="h-6 w-6" />
      </div>

      {/* Navigation */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 w-full space-y-4 px-3">
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
                        ? "bg-gray-100/80 text-gray-900"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    )}
                  >
                    <item.icon className={cn(
                      "h-6 w-6 transition-transform duration-200",
                      isActive ? "scale-105" : "group-hover:scale-110"
                    )} />

                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="ml-2 font-medium bg-gray-900 text-white border-none shadow-lg px-3 py-1.5 rounded-lg"
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
      <div className="w-full px-3 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => signOut()}
              className="flex items-center justify-center w-full aspect-square rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="ml-2 font-medium bg-red-500 text-white border-none shadow-lg px-3 py-1.5 rounded-lg"
          >
            Sign Out
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};
