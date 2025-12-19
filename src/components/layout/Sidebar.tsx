import { Package, ShoppingCart, Truck, Settings, LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Package, label: "Inventory", path: "/dashboard" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: Truck, label: "Logistics", path: "/logistics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  const { signOut } = useClerk();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 sidebar-gradient">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-foreground/10">
            <Package className="h-5 w-5 text-sidebar-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Pharma Zenith
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
