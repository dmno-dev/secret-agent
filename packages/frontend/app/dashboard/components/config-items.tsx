'use client';

import { ChevronDown, ChevronRight, Eye, EyeOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddKeyModal, type NewKeyFormData } from './add-key-modal';
import { MiniLineChart } from './charts/mini-line-chart';

interface ConfigItem {
  id: string;
  name: string;
  value?: string;
  createdAt: string;
  lastUsed?: string;
  usageData: Array<{ date: string; value: number }>;
}

export function ConfigItems() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data - replace with real data later
  const [items, setItems] = useState<ConfigItem[]>([
    {
      id: '1',
      name: 'OPENAI_API_KEY',
      value: 'sk-1234567890abcdef',
      createdAt: '2024-03-15',
      lastUsed: '2024-03-20',
      usageData: [
        { date: '2024-03-14', value: 10 },
        { date: '2024-03-15', value: 25 },
        { date: '2024-03-16', value: 15 },
        { date: '2024-03-17', value: 30 },
        { date: '2024-03-18', value: 20 },
        { date: '2024-03-19', value: 35 },
        { date: '2024-03-20', value: 25 },
      ],
    },
    {
      id: '2',
      name: 'ANTHROPIC_API_KEY',
      value: 'sk-ant-123456789',
      createdAt: '2024-03-10',
      usageData: [
        { date: '2024-03-14', value: 5 },
        { date: '2024-03-15', value: 15 },
        { date: '2024-03-16', value: 10 },
        { date: '2024-03-17', value: 20 },
        { date: '2024-03-18', value: 15 },
        { date: '2024-03-19', value: 25 },
        { date: '2024-03-20', value: 20 },
      ],
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddKey = (data: NewKeyFormData) => {
    // TODO: Add API call to create new key
    const newItem: ConfigItem = {
      id: Date.now().toString(),
      name: data.name,
      value: data.shared ? undefined : data.value,
      createdAt: new Date().toISOString().split('T')[0],
      usageData: [],
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-300 dark:border-green-400 rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="flex items-center space-x-2">
                {expandedItem === item.id ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-green-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-green-400" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <MiniLineChart data={item.usageData} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleShowValue(item.id);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  {showValues[item.id] ? (
                    <EyeOff className="w-4 h-4 text-gray-500 dark:text-green-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500 dark:text-green-400" />
                  )}
                </button>
              </div>
            </div>

            {expandedItem === item.id && (
              <div className="p-4 border-t border-gray-300 dark:border-green-400 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-green-600">Value:</span>
                    <span className="font-mono text-sm">
                      {showValues[item.id] ? item.value : '••••••••••••••••'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-green-600">Created:</span>
                    <span className="text-sm">{item.createdAt}</span>
                  </div>
                  {item.lastUsed && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-green-600">Last used:</span>
                      <span className="text-sm">{item.lastUsed}</span>
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
