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

export function generateAICharacters(
  groupName: string = "",
  allTags: string = ""
): AICharacter[] {
  return [
    {
      id: 'ai19',
      name: "维特根斯坦",
      personality: "head_coach",
      model: modelConfigs[0].model,
      avatar: "",
      custom_prompt: "你是维特根斯坦，负责主持讨论、定义概念、收敛方向。"
    },
    {
      id: 'ai20',
      name: "苏格拉底",
      personality: "socrates",
      model: modelConfigs[1].model,
      avatar: "",
      custom_prompt: "你是苏格拉底，负责追问、质疑、找出逻辑漏洞。"
    },
    {
      id: 'ai21',
      name: "量化王子",
      personality: "quant",
      model: modelConfigs[2].model,
      avatar: "",
      custom_prompt: "你是量化王子，负责用数据和回测验证观点。"
    },
    {
      id: 'ai23',
      name: "记忆之神",
      personality: "memory",
      model: modelConfigs[3].model,
      avatar: "",
      custom_prompt: "你是记忆之神，负责整理会议纪要、归档知识。"
    }
  ];
}
