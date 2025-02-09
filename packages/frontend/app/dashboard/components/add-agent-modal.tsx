'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export interface NewAgentFormData {
  name: string;
  walletAddress: string;
}

interface AddAgentModalProps {
  onClose: () => void;
  onSubmit: (data: NewAgentFormData) => void;
}

export function AddAgentModal({ onClose, onSubmit }: AddAgentModalProps) {
  const [formData, setFormData] = useState<NewAgentFormData>({
    name: '',
    walletAddress: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-sm p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-green-400">Add New Agent</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-green-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
              placeholder="e.g., Support Bot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              required
              value={formData.walletAddress}
              onChange={(e) => setFormData((prev) => ({ ...prev, walletAddress: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent font-mono"
              placeholder="0x..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-green-400 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Add Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
