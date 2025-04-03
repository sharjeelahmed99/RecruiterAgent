import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      {isMobile ? (
        sidebarOpen && (
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-800">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )
      ) : (
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar onSidebarToggle={toggleSidebar} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
