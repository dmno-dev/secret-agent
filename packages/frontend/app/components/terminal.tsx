import { Moon, Sun } from "lucide-react";
import type React from "react";

interface TerminalProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

export function Terminal({
  children,
  isDarkMode,
  setIsDarkMode,
}: TerminalProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-black text-black dark:text-green-400 p-4 font-mono min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
