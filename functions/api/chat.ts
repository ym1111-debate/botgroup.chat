import { aiCharacters } from '../../src/config/aiCharacters';
import { groups } from '../../src/config/groups';

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
}

function extractMentions(message: string, memberNames: string[]): string[] {
  const mentioned: string[] = [];
  for (const name of memberNames) {
    if (message.includes(`@${name}`)) {
      mentioned.push(name);
    }
  }
  return mentioned;
}

function findCharacterByName(name: string) {
  const allChars = aiCharacters('');
  return allChars.find(c => c.name === name);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const body = await request.json() as {
      message: string;
      groupId: string;
      history?: any[];
    };
    
    const { message, groupId, history = [] } = body;
    
    // 找到当前群组
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { status: 404 });
    }
    
    // 获取群成员名称列表
    const memberNames = group.members
      .map(id => {
        const char = findCharacterByName(id);
        return char?.name;
      })
      .filter(Boolean) as string[];
    
    let targetCharacters = [];
    
    if (!group.isGroupDiscussionMode) {
      // 点名模式：检查消息中是否 @ 了某人
      const mentionedNames = extractMentions(message, memberNames);
      
      if (mentionedNames.length > 0) {
        // 只回复被 @ 的成员
        targetCharacters = mentionedNames
          .map(name => findCharacterByName(name))
          .filter(Boolean);
      } else {
        // 没有 @ 任何人，默认调度器或第一个成员
        const defaultChar = findCharacterByName(memberNames[0]);
        if (defaultChar) targetCharacters = [defaultChar];
      }
    } else {
      // 群讨论模式：所有成员都回复
      targetCharacters = group.members
        .map(id => findCharacterByName(id))
        .filter(Boolean);
    }
    
    if (targetCharacters.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid AI to respond' }), { status: 400 });
    }
    
    // 获取第一个被选中的 AI 的模型配置
    const targetChar = targetCharacters[0];
    const modelId = targetChar.model;
    
    // 调用 Ofox API
    const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: targetChar.custom_prompt || '你是一个有用的AI助手。' },
          ...history,
          { role: 'user', content: message }
        ],
        stream: false
      })
    });
    
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。';
    
    return new Response(JSON.stringify({ 
      reply,
      from: targetChar.name,
      model: modelId
    }), { status: 200 });
    
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
