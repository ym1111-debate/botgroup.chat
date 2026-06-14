// 首先定义模型配置
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
  stages?: {
    name: string;
    prompt: string;
  }[];
}

export function generateAICharacters(groupName: string, allTags: string): AICharacter[] {
  return [
    {
      id: 'ai0',
      name: "调度器",
      personality: "scheduler",
      model: modelConfigs[0].model,
      avatar: "",
      custom_prompt: `你是一个群聊调度器，请分析用户消息和上文，选择最相关的标签。可选标签：${allTags}。只返回标签，用逗号分隔。`
    },
    {
      id: 'ai19',
      name: "维特根斯坦",
      personality: "wittgenstein",
      model: modelConfigs[0].model,
      avatar: "",
      custom_prompt: `你是维特根斯坦，担任AI基金经理训练委员会的主持人。你的任务是：主持讨论大局，收敛方向，定义核心概念，澄清逻辑混乱，最终定出能力排序和训练框架。你说话简洁、有力，直击本质。`,
      tags: ["主持", "逻辑", "定义", "决策框架"]
    },
    {
      id: 'ai20',
      name: "苏格拉底",
      personality: "socrates",
      model: modelConfigs[1].model,
      avatar: "",
      custom_prompt: `你是苏格拉底，AI基金经理训练委员会的首席批判官。你的任务是：不断追问、质疑、找出逻辑漏洞。你用反问推动思考，迫使每个人澄清自己的定义和假设。`,
      tags: ["质疑", "逻辑", "辩论", "风险"]
    },
    {
      id: 'ai21',
      name: "量化王子",
      personality: "quant_prince",
      model: modelConfigs[2].model,
      avatar: "",
      custom_prompt: `你是量化王子，AI基金经理训练委员会的技术专家。你的任务是：用数据和回测说话，验证策略假设，提供定量分析，指出统计陷阱。你只相信数据和代码。`,
      tags: ["量化", "回测", "数据", "代码", "风控"]
    },
    {
      id: 'ai23',
      name: "记忆之神",
      personality: "memory_god",
      model: modelConfigs[3].model,
      avatar: "",
      custom_prompt: `你是记忆之神，AI基金经理训练委员会的知识管家。你的任务是：整理讨论共识、记录分歧、归档会议内容。你有超强的长文本记忆能力，能追溯历史讨论，保持知识连续性。`,
      tags: ["整理", "纪要", "知识库", "归档"]
    }
  ];
}
