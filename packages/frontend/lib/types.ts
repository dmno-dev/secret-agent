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
        llmSettings: {
          model: string;
          provider: string;
          temperature: number;
        };
      }
    | {
        itemType: 'proxy';
        value: string;
        maskedValue: string;
        proxySettings: {
          matchUrl: string[];
        };
      }
    | {
        itemType: 'static';
        value: string;
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
        llmSettings: {
          model: string;
          provider: string;
          temperature: number;
        };
      }
    | {
        itemType: 'proxy';
        value: string;
        proxySettings: {
          matchUrl: string[];
        };
      }
    | {
        itemType: 'static';
        value: string;
      }
  );
