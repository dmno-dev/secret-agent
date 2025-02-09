'use client';

import { Terminal } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

// can change this later when we have a full set of commands
const SAMPLE_COMMANDS = [
  { id: 1, label: 'connect', description: 'Connect to a deployed agent' },
  { id: 2, label: 'add key', description: 'Add a new API key' },
  { id: 3, label: 'list keys', description: 'List all API keys' },
  { id: 4, label: 'revoke key', description: 'Revoke an existing API key' },
];

type ConnectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (url: string, username: string, password: string) => void;
};

function ConnectionModal({ isOpen, onClose, onConnect }: ConnectionModalProps) {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(url, username, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[6000]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-green-400">
          Connect to Agent
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Agent URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://autonome.alt.technology/agent-ixznex"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-green-400"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CommandLine() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SAMPLE_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(command.toLowerCase())
  );

  const handleConnect = async (url: string, username: string, password: string) => {
    try {
      const response = await fetch(`${url}/poke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa(`${username}:${password}`),
        },
        body: JSON.stringify({
          text: 'Hello! What can you do?',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`);
      }

      const data = await response.json();
      setOutput(`Connected successfully! Agent response: ${data.text}`);
    } catch (error) {
      setOutput(
        `Error connecting to agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

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
            setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredCommands.length > 0) {
              const selectedCommand = filteredCommands[selectedIndex].label;
              if (selectedCommand === 'connect') {
                setIsModalOpen(true);
              }
              setCommand('');
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

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && popoverRef.current && isFocused) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const popoverHeight = popoverRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - inputRect.bottom;

        // If there's not enough space below (less than popover height + 10px padding)
        setShowAbove(spaceBelow < popoverHeight + 10);
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isFocused]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (command === 'connect') {
      setIsModalOpen(true);
    } else {
      setOutput(`Executing command: ${command}`);
    }
    setCommand('');
    setSelectedIndex(0);
    inputRef.current?.blur();
  };

  return (
    <>
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
            placeholder={isFocused ? 'Type a command...' : 'Enter command... (⌘K)'}
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-green-400 placeholder-gray-500 dark:placeholder-green-600"
          />
        </form>

        {isFocused && filteredCommands.length > 0 && (
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              left: inputRef.current?.getBoundingClientRect().left ?? 0,
              ...(showAbove
                ? {
                    bottom: `${window.innerHeight - (inputRef.current?.getBoundingClientRect().top ?? 0)}px`,
                  }
                : { top: `${(inputRef.current?.getBoundingClientRect().bottom ?? 0) + 8}px` }),
            }}
            className="w-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto z-[5000]"
          >
            {filteredCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                className={`p-2 cursor-pointer ${
                  index === selectedIndex
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  if (cmd.label === 'connect') {
                    setIsModalOpen(true);
                  } else {
                    setCommand(cmd.label);
                  }
                  inputRef.current?.focus();
                }}
              >
                <div className="font-medium text-gray-800 dark:text-green-400">{cmd.label}</div>
                <div className="text-sm text-gray-500 dark:text-green-600">{cmd.description}</div>
              </div>
            ))}
          </div>
        )}

        {output && <div className="mt-2 text-sm text-gray-600 dark:text-green-400">{output}</div>}
      </div>

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
      />
    </>
  );
}
