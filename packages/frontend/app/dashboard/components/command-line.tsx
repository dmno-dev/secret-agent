'use client';

import { Send } from 'lucide-react';
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

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export function CommandLine() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${DMNO_PUBLIC_CONFIG.CHATBOT_URL}/poke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' +
            btoa(`${DMNO_PUBLIC_CONFIG.CHATBOT_USERNAME}:${DMNO_PUBLIC_CONFIG.CHATBOT_PASSWORD}`),
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: 'Sorry, I encountered an error while processing your message.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-green-400">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-green-400'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 dark:bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 dark:bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-500 dark:bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300 dark:border-green-400">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? 'Waiting for response...' : 'Type a message... (⌘K)'}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-green-400 placeholder-gray-500 dark:placeholder-green-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send
              size={20}
              className={`${
                isLoading || !input.trim()
                  ? 'text-gray-400 dark:text-gray-600'
                  : 'text-green-500 dark:text-green-400'
              }`}
            />
          </button>
        </div>
      </form>

      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={(url, username, password) => {
          // Handle connection logic
        }}
      />
    </div>
  );
}
