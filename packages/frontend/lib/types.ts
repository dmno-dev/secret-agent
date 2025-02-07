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

type BaseConfigItem = {
  key: string;
  projectId: string;
  createdAt: string;
  usageData?: {
    date: string;
    value: number;
  }[];
};

export type ConfigItem = BaseConfigItem &
  (
    | {
        itemType: 'llm';
        llmSettings: Record<string, never>;
      }
    | {
        itemType: 'proxy';
        maskedValue: string;
        proxySettings: {
          matchUrls: string[];
        };
      }
    | {
        itemType: 'static';
        maskedValue: string;
      }
  );

type BaseConfigItemCreate = {
  key: string;
};

export type ConfigItemCreate = BaseConfigItemCreate &
  (
    | {
        itemType: 'llm';
        llmSettings: Record<string, never>;
      }
    | {
        itemType: 'proxy';
        value: string;
        proxySettings: {
          matchUrls: string[];
        };
      }
    | {
        itemType: 'static';
        value: string;
      }
  );
