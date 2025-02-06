"use client";

import { Terminal } from "lucide-react";
import type React from "react";
import { useState, useEffect, useRef } from "react";

// can change this later when we have a full set of commands
const SAMPLE_COMMANDS = [
  { id: 1, label: "add key", description: "Add a new API key" },
  { id: 2, label: "list keys", description: "List all API keys" },
  { id: 3, label: "revoke key", description: "Revoke an existing API key" },
];

export function CommandLine() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = SAMPLE_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(command.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (isFocused) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredCommands.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev);
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredCommands.length > 0) {
              setCommand(filteredCommands[selectedIndex].label);
              setOutput(`Executing command: ${filteredCommands[selectedIndex].label}`);
              setCommand("");
              setSelectedIndex(0);
              inputRef.current?.blur();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, selectedIndex, filteredCommands]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    setOutput(`Executing command: ${command}`);
    setCommand("");
    setSelectedIndex(0);
    inputRef.current?.blur();
  };

  return (
    <div className="relative bg-gray-100 dark:bg-gray-900 p-4 border-t border-gray-300 dark:border-green-400 overflow-visible">
      <form onSubmit={handleCommand} className="flex items-center space-x-2">
        <Terminal size={20} className="text-gray-600 dark:text-green-400" />
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => {
            setCommand(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          placeholder={isFocused ? "Type a command..." : "Enter command... (⌘K)"}
          className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-green-400 placeholder-gray-500 dark:placeholder-green-600"
        />
      </form>

      {isFocused && filteredCommands.length > 0 && (
        <div className="fixed w-[500px] mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto z-[5000]">
          {filteredCommands.map((cmd, index) => (
            <div
              key={cmd.id}
              className={`p-2 cursor-pointer ${index === selectedIndex
                ? "bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                setCommand(cmd.label);
                inputRef.current?.focus();
              }}
            >
              <div className="font-medium text-gray-800 dark:text-green-400">
                {cmd.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-green-600">
                {cmd.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {output && (
        <div className="mt-2 text-sm text-gray-600 dark:text-green-400">
          {output}
        </div>
      )}
    </div>
  );
}
