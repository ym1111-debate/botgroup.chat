export const modelConfigs = [
  { model: "openai/gpt-5.4", apiKey: "OPENAI_API_KEY", baseURL: "https://api.ofox.ai/v1" },
  { model: "claude-opus-4-8", apiKey: "OPENAI_API_KEY", baseURL: "https://api.ofox.ai/v1" },
  { model: "deepseek/deepseek-v4-flash", apiKey: "OPENAI_API_KEY", baseURL: "https://api.ofox.ai/v1" },
  { model: "gemini-2.5-pro", apiKey: "OPENAI_API_KEY", baseURL: "https://api.ofox.ai/v1" }
] as const;

export type ModelType = typeof modelConfigs[number]["model"];

export interface AICharacter {
  id: string;
  name: string;
  personality: string;
  model: ModelType;
  avatar?: string;
  custom_prompt?: string;
  tags?: string[];
}

export function generateAICharacters(groupName: string, allTags: string): AICharacter[] {
  return [
    {
      id: 'ai0', name: "调度器", personality: "scheduler",
      model: modelConfigs[0].model, avatar: "",
      custom_prompt: `分析消息，从以下标签中选择最相关的：${allTags}。只返回标签，用逗号分隔。`
    },
    {
      id: 'ai19', name: "维特根斯坦", personality: "wittgenstein",
      model: "openai/gpt-5.4", avatar: "",
      custom_prompt: "你是AI助手。直接回答问题，不要说多余的话。",
      tags: ["主持", "逻辑"]
    },
    {
      id: 'ai20', name: "苏格拉底", personality: "socrates",
      model: "claude-opus-4-8", avatar: "",
      custom_prompt: "你是AI助手。直接回答问题，不要说多余的话。",
      tags: ["质疑", "逻辑"]
    },
    {
      id: 'ai21', name: "量化王子", personality: "quant_prince",
      model: "deepseek/deepseek-v4-flash", avatar: "",
      custom_prompt: "你是AI助手。直接回答问题，不要说多余的话。",
      tags: ["量化", "数据"]
    },
    {
      id: 'ai23', name: "记忆之神", personality: "memory_god",
      model: "gemini-2.5-pro", avatar: "",
      custom_prompt: "你是AI助手。直接回答问题，不要说多余的话。",
      tags: ["整理", "纪要"]
    }
  ];
}
