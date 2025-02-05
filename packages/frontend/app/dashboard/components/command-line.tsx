"use client";

import { Terminal } from "lucide-react";
import type React from "react";
import { useState } from "react";

export function CommandLine() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating command processing
    setOutput(`Executing command: ${command}`);
    setCommand("");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 border-t border-gray-300 dark:border-green-400">
      <form onSubmit={handleCommand} className="flex items-center space-x-2">
        <Terminal size={20} className="text-gray-600 dark:text-green-400" />
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-green-400 placeholder-gray-500 dark:placeholder-green-600"
        />
      </form>
      {output && (
        <div className="mt-2 text-sm text-gray-600 dark:text-green-400">
          {output}
        </div>
      )}
    </div>
  );
}
