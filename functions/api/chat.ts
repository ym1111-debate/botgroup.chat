import { generateAICharacters } from '../../src/config/aiCharacters';
import { groups } from '../../src/config/groups';

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  DEEPSEEK_API_KEY: string;
}

function findCharacter(nameOrId: string) {
  const allChars = generateAICharacters("", "");
  return allChars.find(c => c.name === nameOrId || c.id === nameOrId);
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (request.method === "GET") {
    return new Response("chat function alive", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json() as {
      message: string;
      groupId?: string;
      history?: any[];
      aiName?: string;
      personality?: string;
      model?: string;
      custom_prompt?: string;
    };

    const {
      message,
      groupId = "",
      history = [],
      aiName = "",
      personality = "",
      model = "",
      custom_prompt = ""
    } = body;

    let targetChar: any = null;

    if (aiName) {
      targetChar = findCharacter(aiName);
    }

    if (!targetChar && personality) {
      const allChars = generateAICharacters("", "");
      targetChar = allChars.find(c => c.personality === personality);
    }

    if (!targetChar && model) {
      const allChars = generateAICharacters("", "");
      targetChar = allChars.find(c => c.model === model);
    }

    if (!targetChar && groupId) {
      const group = groups.find(g => g.id === groupId);

      if (group && group.members && group.members.length > 0) {
        targetChar = findCharacter(group.members[0]);
      }
    }

    if (!targetChar) {
      targetChar = findCharacter("ai19") || findCharacter("GPT");
    }

    if (!targetChar) {
      return new Response(JSON.stringify({
        reply: "找不到可用的 AI 角色。",
        from: "系统",
        model: "none"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const modelId = targetChar.model;
    const isDeepSeek =
      targetChar.name === "DeepSeek" ||
      targetChar.personality === "deepseek" ||
      modelId === "deepseek-chat" ||
      modelId === "deepseek-reasoner" ||
      modelId.includes("deepseek");

    const apiBaseUrl = isDeepSeek
      ? "https://api.deepseek.com/v1"
      : env.OPENAI_BASE_URL;

    const apiKey = isDeepSeek
      ? env.DEEPSEEK_API_KEY
      : env.OPENAI_API_KEY;

    const finalModel = isDeepSeek
      ? "deepseek-chat"
      : modelId;

    const aiResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: finalModel,
        messages: [
          {
            role: "system",
            content:
              custom_prompt ||
              targetChar.custom_prompt ||
              "你是一个有用的AI助手。"
          },
          ...history,
          {
            role: "user",
            content: message || "你好"
          }
        ],
        stream: false
      })
    });

    const data: any = await aiResponse.json();

    if (!aiResponse.ok) {
      return new Response(JSON.stringify({
        reply: `AI接口失败：${aiResponse.status}。${JSON.stringify(data).slice(0, 500)}`,
        from: targetChar.name,
        model: finalModel
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "抱歉，我没有收到模型回复。";

    return new Response(JSON.stringify({
      reply,
      from: targetChar.name,
      model: finalModel
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      reply: `后端错误：${error?.message || String(error)}`,
      from: "系统",
      model: "error"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
