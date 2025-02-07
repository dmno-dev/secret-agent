'use client';

import { ConfigItemCreate } from '@/lib/types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AddKeyModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddKeyModal({ onClose, onSubmit }: AddKeyModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    itemType: 'llm',
    value: '',
    llmSettings: {},
    proxySettings: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-green-400">Add New Config Item</h3>
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
              value={formData.key}
              onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
              placeholder="e.g., OPENAI_API_KEY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Item Type
            </label>
            <select
              id="itemType"
              onChange={(e) => setFormData((prev) => ({ ...prev, itemType: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
            >
              <option value="llm">llm - pay-per-use LLM api key</option>
              <option value="proxy">proxy - user owned, inserted by proxy</option>
              <option value="static">static - user owned, fetched by agent</option>
            </select>
          </div>

          {(formData.itemType === 'proxy' || formData.itemType === 'static') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
                Value
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

          {formData.itemType === 'proxy' && (
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
          )}

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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
