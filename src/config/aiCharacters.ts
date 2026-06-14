export const modelConfigs = [
  {
    model: "openai/gpt-5.4",
    apiKey: "OPENAI_API_KEY",
    baseURL: "https://api.ofox.ai/v1"
  },
  {
    model: "claude-opus-4-8",
    apiKey: "OPENAI_API_KEY",
    baseURL: "https://api.ofox.ai/v1"
  },
  {
    model: "deepseek/deepseek-v4-flash",
    apiKey: "OPENAI_API_KEY",
    baseURL: "https://api.ofox.ai/v1"
  },
  {
    model: "gemini-2.5-pro",
    apiKey: "OPENAI_API_KEY",
    baseURL: "https://api.ofox.ai/v1"
  }
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

const cleanPrompt =
  "你是一个专业、友好、实用的AI助手。请直接回答用户问题，不要扮演角色，不要故意抬杠，不要故意做会议记录，不要讨论自己的身份。";

export function generateAICharacters(
  groupName: string = "",
  allTags: string = ""
): AICharacter[] {
  return [
    {
      id: 'ai19',
      name: "GPT",
      personality: "gpt",
      model: modelConfigs[0].model,
      avatar: "",
      custom_prompt: cleanPrompt
    },
    {
      id: 'ai20',
      name: "Claude",
      personality: "claude",
      model: modelConfigs[1].model,
      avatar: "",
      custom_prompt: cleanPrompt
    },
    {
      id: 'ai21',
      name: "DeepSeek",
      personality: "deepseek",
      model: modelConfigs[2].model,
      avatar: "",
      custom_prompt: cleanPrompt
    },
    {
      id: 'ai23',
      name: "Gemini",
      personality: "gemini",
      model: modelConfigs[3].model,
      avatar: "",
      custom_prompt: cleanPrompt
    }
  ];
}
