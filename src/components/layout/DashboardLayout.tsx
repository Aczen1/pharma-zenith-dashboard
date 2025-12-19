import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";
import { Chatbot } from "@/components/chat/Chatbot";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  // Fixed icon-only sidebar
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={true}
        onToggle={() => { }}
      />
      <div className="ml-20 transition-all duration-300">
        <TopBar title={title} />
        <main className="p-6">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
};
