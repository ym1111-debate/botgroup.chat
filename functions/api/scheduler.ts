import { modelConfigs, generateAICharacters } from '../../src/config/aiCharacters';
import OpenAI from 'openai';

interface AICharacter {
  id: string;
  name: string;
  tags?: string[];
}

interface MessageHistory {
  role: string;
  content: string;
  name: string;
}

export async function onRequestPost({ env, request }) {
  console.log('scheduler');
  try {
    const { message, history, availableAIs } = await request.json();
    const selectedAIs = await scheduleAIResponses(message, history, availableAIs, env);

    return Response.json({
      selectedAIs: selectedAIs
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function detectNamedAIs(message: string, availableAIs: AICharacter[]): string[] {
  const selected: string[] = [];

  for (const ai of availableAIs) {
    const name = ai.name;

    if (
      message.includes(`@${name}`) ||
      message.includes(`${name}，`) ||
      message.includes(`${name},`) ||
      message.includes(`${name} `) ||
      message.includes(`请${name}`) ||
      message.includes(`让${name}`) ||
      message.includes(`${name}发言`) ||
      message.includes(`${name}回答`) ||
      message.includes(`${name}总结`) ||
      message.includes(`${name}怎么看`) ||
      message.includes(`${name}来`)
    ) {
      selected.push(ai.id);
    }
  }

  return selected;
}

async function analyzeMessageWithAI(message: string, allTags: string[], env: any, history: MessageHistory[] = []): Promise<string[]> {
  const shedulerAI = generateAICharacters(message, allTags.join(','))[0];
  const modelConfig = modelConfigs.find(config => config.model === shedulerAI.model);

  if (!modelConfig) {
    throw new Error(`调度模型未配置：${shedulerAI.model}`);
  }

  const apiKey = env[modelConfig.apiKey];
  if (!apiKey) {
    throw new Error(`${modelConfig.model} 的API密钥未配置`);
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: modelConfig.baseURL,
  });

  const prompt = shedulerAI.custom_prompt;

  try {
    const completion = await openai.chat.completions.create({
      model: shedulerAI.model,
      messages: [
        { role: "user", content: prompt },
        ...history.slice(-10),
        { role: "user", content: message }
      ],
    });

    const matchedTags = completion.choices[0].message.content?.split(',').map(tag => tag.trim()) || [];
    return matchedTags;
  } catch (error) {
    console.error('AI分析失败:', error.message);
    return [];
  }
}

async function scheduleAIResponses(
  message: string,
  history: MessageHistory[],
  availableAIs: AICharacter[],
  env: any
): Promise<string[]> {

  // 0. 主持人点名模式：只要消息中点名某个导师，就只让被点名的人发言
  const namedAIIds = detectNamedAIs(message, availableAIs);
  if (namedAIIds.length > 0) {
    console.log('主持人点名发言:', namedAIIds);
    return namedAIIds;
  }

  // 1. 收集所有可用的标签
  const allTags = new Set<string>();
  availableAIs.forEach(ai => {
    ai.tags?.forEach(tag => allTags.add(tag));
  });

  // 2. 使用AI模型分析消息并匹配标签
  const matchedTags = await analyzeMessageWithAI(message, Array.from(allTags), env, history);
  console.log('matchedTags', matchedTags, allTags);

  // 如果含有"文字游戏"标签，则需要全员参与
  if (matchedTags.includes("文字游戏")) {
    return availableAIs.map(ai => ai.id);
  }

  // 3. 计算每个AI的匹配分数
  const aiScores = new Map<string, number>();
  const messageLC = message.toLowerCase();

  for (const ai of availableAIs) {
    if (!ai.tags) continue;

    let score = 0;

    matchedTags.forEach(tag => {
      if (ai.tags?.includes(tag)) {
        score += 2;
      }
    });

    if (messageLC.includes(ai.name.toLowerCase())) {
      score += 5;
    }

    const recentHistory = history.slice(-5);
    recentHistory.forEach(hist => {
      if (hist.name === ai.name && hist.content.length > 0) {
        score += 1;
      }
    });

    if (score > 0) {
      aiScores.set(ai.id, score);
    }
  }

  // 4. 根据分数排序选择AI
  const sortedAIs = Array.from(aiScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // 5. 如果没有匹配到任何AI，默认只让总教练发言
  if (sortedAIs.length === 0) {
    const headCoach = availableAIs.find(ai => ai.name === "总教练");
    if (headCoach) {
      return [headCoach.id];
    }

    return availableAIs.length > 0 ? [availableAIs[0].id] : [];
  }

  // 6. 标准模式最多2人，避免刷屏
  const MAX_RESPONDERS = 2;
  return sortedAIs.slice(0, MAX_RESPONDERS);
}
