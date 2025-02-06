'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export interface NewKeyFormData {
  name: string;
  shared: boolean;
  value?: string;
  domainRules: string;
}

interface AddKeyModalProps {
  onClose: () => void;
  onSubmit: (data: NewKeyFormData) => void;
}

export function AddKeyModal({ onClose, onSubmit }: AddKeyModalProps) {
  const [formData, setFormData] = useState<NewKeyFormData>({
    name: '',
    shared: true,
    value: '',
    domainRules: '*',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-green-400">Add New Key</h3>
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
              Key Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
              placeholder="e.g., OPENAI_API_KEY"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="shared"
              checked={formData.shared}
              onChange={(e) => setFormData((prev) => ({ ...prev, shared: e.target.checked }))}
              className="rounded border-gray-300 dark:border-green-400"
            />
            <label htmlFor="shared" className="text-sm text-gray-700 dark:text-green-400">
              Shared key (value managed by system)
            </label>
          </div>

          {!formData.shared && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
                Key Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
                placeholder="Enter key value"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Domain Match Rules
            </label>
            <input
              type="text"
              required
              value={formData.domainRules}
              onChange={(e) => setFormData((prev) => ({ ...prev, domainRules: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
              placeholder="*.example.com, app.domain.com"
            />
            <p className="text-sm text-gray-500 dark:text-green-600 mt-1">
              Comma-separated list of domains. Use * for wildcards.
            </p>
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
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
