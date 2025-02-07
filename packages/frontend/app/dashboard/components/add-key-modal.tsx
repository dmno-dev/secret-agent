'use client';

import { ConfigItem } from '@/lib/types';
import { Eye, EyeOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type NewKeyFormData = {
  name: string;
  type: 'llm' | 'proxy' | 'static';
  value?: string;
  matchUrl?: string[];
  matchUrlInput?: string;
};

export interface AddKeyModalProps {
  onClose: () => void;
  onSubmit: (data: NewKeyFormData) => void;
  editingItem?: ConfigItem | null;
}

export function AddKeyModal({ onClose, onSubmit, editingItem }: AddKeyModalProps) {
  const [formData, setFormData] = useState<NewKeyFormData>({
    name: '',
    type: 'llm',
    matchUrlInput: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.key,
        type: editingItem.itemType,
        value: '', // We don't show the existing value for security
        matchUrlInput:
          editingItem.itemType === 'proxy'
            ? editingItem.proxySettings?.matchUrl?.join(', ') || ''
            : '',
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type !== 'llm' && !formData.value) {
      toast.error('Value is required for non-LLM keys');
      return;
    }

    if (formData.type === 'proxy') {
      const matchUrl = formData.matchUrlInput
        ?.split(',')
        .map((url) => url.trim())
        .filter(Boolean);

      if (!matchUrl || matchUrl.length === 0) {
        toast.error('At least one match URL is required for proxy keys');
        return;
      }

      onSubmit({ ...formData, matchUrl });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-green-400">
            {editingItem ? 'Edit Config Item' : 'Add New Config Item'}
          </h3>
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
              disabled={!!editingItem}
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
                disabled={!!editingItem}
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
                disabled={!!editingItem}
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
                disabled={!!editingItem}
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-green-400 rounded bg-transparent pr-10"
                  placeholder={editingItem ? 'Enter new value' : 'Enter value'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                value={formData.matchUrlInput}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, matchUrlInput: e.target.value }))
                }
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
              {editingItem ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
