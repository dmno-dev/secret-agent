'use client';

import { secretAgentApi } from '@/lib/api';
import { ConfigItem } from '@/lib/types';
import { ChevronDown, ChevronRight, Eye, EyeOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddKeyModal, type NewKeyFormData } from './add-key-modal';

interface ConfigItemsProps {
  configItems: ConfigItem[];
  projectId: string;
}

export function ConfigItems({ configItems, projectId }: ConfigItemsProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleExpand = (key: string) => {
    setExpandedItem(expandedItem === key ? null : key);
  };

  const toggleShowValue = (key: string) => {
    setShowValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddKey = async (data: NewKeyFormData) => {
    try {
      if (!data.shared && !data.value) {
        throw new Error('Value is required when not shared');
      }

      const configItem: ConfigItem = {
        key: data.name,
        value: data.shared ? null : data.value!,
        createdAt: new Date().toISOString(),
        projectId: projectId,
        itemType: 'user',
        settings: null,
      };

      await secretAgentApi.post(`projects/${projectId}/config`, {
        json: configItem,
      });

      toast.success('Config item created successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating config item:', error);
      toast.error('Failed to create config item');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {configItems.map((item) => (
          <div
            key={item.key}
            className="border border-gray-300 dark:border-green-400 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => toggleExpand(item.key)}
            >
              <div className="flex items-center space-x-2">
                {expandedItem === item.key ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-green-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-green-400" />
                )}
                <span className="font-medium">{item.key}</span>
                <span className="text-sm text-gray-500">({item.itemType})</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShowValue(item.key);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                {showValues[item.key] ? (
                  <EyeOff className="w-4 h-4 text-gray-500 dark:text-green-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500 dark:text-green-400" />
                )}
              </button>
            </div>

            {expandedItem === item.key && (
              <div className="p-4 border-t border-gray-300 dark:border-green-400 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-green-600">Value:</span>
                    <span className="font-mono text-sm">
                      {showValues[item.key] ? item.value : '••••••••••••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-green-600">Created:</span>
                    <span className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {item.settings && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-green-600">Settings:</span>
                      <span className="text-sm font-mono">{JSON.stringify(item.settings)}</span>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 mt-4">
                    <button className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900">
                      Revoke
                    </button>
                    <button className="text-sm px-3 py-1 border border-gray-300 dark:border-green-400 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      Rotate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full p-2 border border-dashed border-gray-300 dark:border-green-400 rounded-lg text-gray-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add new key</span>
      </button>

      {showAddModal && (
        <AddKeyModal onClose={() => setShowAddModal(false)} onSubmit={handleAddKey} />
      )}
    </div>
  );
}
