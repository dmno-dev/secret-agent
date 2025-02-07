export interface Project {
  id: string;
  privyServerWalletId: string;
  name: string;
  ownedByUserId: string;
  createdAt: string;
  balance?: string;
}

export interface Agent {
  id: string;
  projectId: string;
  label: string;
  status: 'pending' | 'enabled' | 'paused' | 'disabled';
  createdAt: string;
}

export interface ConfigItem {
  value: string | null;
  createdAt: string;
  projectId: string;
  key: string;
  itemType: 'llm' | 'user';
  settings: {
    foo: string;
  } | null;
  usageData: {
    date: string;
    value: number;
  }[];
}
