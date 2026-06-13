import OpenAI from 'openai';
import { modelConfigs } from '../../src/config/aiCharacters';

export async function onRequestPost({ env, request }) {
  try {
    const { message, custom_prompt, history, aiName, index, model = "qwen-plus" } = await request.json();

    const modelConfig = modelConfigs.find(config => config.model === model);

    if (!modelConfig) {
      throw new Error(`不支持的模型类型：${model}`);
    }

    const apiKey = env[modelConfig.apiKey];

    if (!apiKey) {
      throw new Error(`${model} 的API密钥未配置，缺少环境变量：${modelConfig.apiKey}`);
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: modelConfig.baseURL
    });

    const systemPrompt =
      custom_prompt +
      "\n注意重要：1、你在群里叫" + aiName +
      "，认准自己的身份；2、你的输出内容不要加" + aiName +
      "：这种多余前缀；3、保持群聊风格，字数尽量简短。";

    const baseMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
    ];

    const userMessage = { role: "user", content: message };

    if (index === 0) {
      baseMessages.push(userMessage);
    } else {
      baseMessages.splice(baseMessages.length - index, 0, userMessage);
    }

    const stream = await openai.chat.completions.create({
      model: model,
      messages: baseMessages,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.close();
        } catch (error) {
          console.error("STREAM_ERROR:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("CHAT_API_ERROR:", error);

    return Response.json(
      {
        error: error.message || String(error),
        detail: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}
