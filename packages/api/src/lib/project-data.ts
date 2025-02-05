
type ConfigItem = Record<string, {
  urlPatterns: Array<string>,
  value: string,
}>
type LLMKey = Record<string, {
  provider: string,
  model: string
}>;

export const MOCKED_PROJECT_DATA = {
  projectId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // example address
  contactEmail: 'theo@dmno.dev',
  llmKeys: {
    LLM_API_KEY: {
      provider: 'openai',
      model: 'gpt-4o-mini',
    }
  } as LLMKey,
  configItems: {
    LANGSMITH_API_KEY: {
      urlPatterns: ['api.smith.langchain.com'],
      value: 'fill-this-in',
    },
    OTHER_KEY: {
      urlPatterns: ['dummyjson.com'],
      value: 'super-secret-api-key',
    }
  } as ConfigItem
}