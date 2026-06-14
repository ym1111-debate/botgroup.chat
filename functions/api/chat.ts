export async function onRequestGet() {
  return new Response("chat function alive", {
    status: 200,
    headers: { "Content-Type": "text/plain" }
  });
}
import { generateAICharacters } from '../../src/config/aiCharacters';
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

function findCharacter(nameOrId: string) {
  const allChars = generateAICharacters("", "");
  return allChars.find(c => c.name === nameOrId || c.id === nameOrId);
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

    const group = groups.find(g => g.id === groupId);

    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const memberCharacters = group.members
      .map(id => findCharacter(id))
      .filter(Boolean);

    const memberNames = memberCharacters.map(c => c!.name);

    let targetCharacters: any[] = [];

    if (!group.isGroupDiscussionMode) {
      const mentionedNames = extractMentions(message, memberNames);

      if (mentionedNames.length > 0) {
        targetCharacters = mentionedNames
          .map(name => findCharacter(name))
          .filter(Boolean);
      } else if (memberCharacters.length > 0) {
        targetCharacters = [memberCharacters[0]];
      }
    } else {
      targetCharacters = memberCharacters;
    }

    if (targetCharacters.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid AI to respond' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const targetChar = targetCharacters[0];
    const modelId = targetChar.model;

    const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: targetChar.custom_prompt || '你是一个有用的AI助手。'
          },
          ...history,
          {
            role: 'user',
            content: message
          }
        ],
        stream: false
      })
    });

    const data: any = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'AI request failed',
        status: response.status,
        details: data
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      '抱歉，我无法回答这个问题。';

    return new Response(JSON.stringify({
      reply,
      from: targetChar.name,
      model: modelId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Chat error:', error);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error?.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
