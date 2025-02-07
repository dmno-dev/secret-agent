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

export type ConfigItem = {
  createdAt: string;
  projectId: string;
  key: string;
  usageData?: {
    date: string;
    value: number;
  }[];
} & (
  | {
      itemType: 'llm';
      llmSettings: {};
    }
  | {
      itemType: 'proxy';
      maskedValue: string;
      proxySettings: {
        matchUrl: Array<string>;
      };
    }
  | {
      itemType: 'static';
      maskedValue: string;
    }
);

export type ConfigItemCreate = Omit<ConfigItem, 'createdAt'>;
