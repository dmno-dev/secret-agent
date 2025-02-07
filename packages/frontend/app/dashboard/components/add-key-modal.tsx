'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type NewKeyFormData = {
  name: string;
  type: 'llm' | 'proxy' | 'static';
  value?: string;
  matchUrls?: string[];
};

interface AddKeyModalProps {
  onClose: () => void;
  onSubmit: (data: NewKeyFormData) => void;
}

export function AddKeyModal({ onClose, onSubmit }: AddKeyModalProps) {
  const [formData, setFormData] = useState<NewKeyFormData>({
    name: '',
    type: 'llm',
    value: '',
    matchUrls: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type !== 'llm' && !formData.value) {
      toast.error('Value is required for non-LLM keys');
      return;
    }

    onSubmit(formData);
  };

  const handleMatchUrlsChange = (value: string) => {
    const urls = value
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, matchUrls: urls }));
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
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
              placeholder="e.g., OPENAI_API_KEY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
              Key Type
            </label>
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'llm' }))}
                className={`flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-green-400 first:rounded-l-md last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-green-500 ${
                  formData.type === 'llm'
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-transparent text-gray-700 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                LLM
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'proxy' }))}
                className={`flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-green-400 first:rounded-l-md last:rounded-r-md -ml-px focus:z-10 focus:ring-2 focus:ring-green-500 ${
                  formData.type === 'proxy'
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-transparent text-gray-700 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Proxy
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'static' }))}
                className={`flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-green-400 first:rounded-l-md last:rounded-r-md -ml-px focus:z-10 focus:ring-2 focus:ring-green-500 ${
                  formData.type === 'static'
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-transparent text-gray-700 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Static
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-green-600">
              {formData.type === 'llm'
                ? 'Pay-per-use LLM API key'
                : formData.type === 'proxy'
                  ? 'User owned key, inserted by proxy'
                  : 'Static value, fetched by agent'}
            </p>
          </div>

          {(formData.type === 'proxy' || formData.type === 'static') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
                Value
              </label>
              <input
                type="text"
                required
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent"
                placeholder="Enter key value"
              />
            </div>
          )}

          {formData.type === 'proxy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
                Match URLs
              </label>
              <input
                type="text"
                required
                value={formData.matchUrls?.join(', ')}
                onChange={(e) => handleMatchUrlsChange(e.target.value)}
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
