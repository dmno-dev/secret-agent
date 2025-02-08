import { InferSelectModel } from 'drizzle-orm';
import { configItemsTable } from '../db/schema';

type ConfigItem = InferSelectModel<typeof configItemsTable>;

export function serializeConfigItem(configItem: ConfigItem) {
  return {
    key: configItem.key,
    itemType: configItem.itemType,
    createdAt: configItem.createdAt,
    ...(configItem.itemType === 'llm' && {
      llmSettings: configItem.settings,
    }),
    ...(configItem.itemType === 'proxy' && {
      proxySettings: configItem.settings,
    }),
    ...(['proxy', 'static'].includes(configItem.itemType) && {
      maskedValue: configItem.value?.slice(0, 4) + '****' + configItem.value?.slice(-3),
    }),
  };
}
