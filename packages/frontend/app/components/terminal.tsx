"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useAccount } from "wagmi";

interface TerminalProps {
  children: React.ReactNode;
}

export function Terminal({ children }: TerminalProps) {
  const { theme, setTheme } = useTheme();
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-green-400 p-4 transition-colors duration-100">
      <div className="max-w-6xl mx-auto terminal-window rounded-lg overflow-hidden border border-gray-300 dark:border-green-400">
        <div className="flex justify-between items-center bg-gray-200 dark:bg-green-900 p-2 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {isConnected && !isDashboard && (
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors font-mono"
              >
                $ cd /dashboard
              </Link>
            )}
            {isDashboard && (
              <Link
                href="/"
                className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors font-mono"
              >
                $ cd /home
              </Link>
            )}
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-100">
          {children}
        </div>
      </div>
    </div>
  );
}
