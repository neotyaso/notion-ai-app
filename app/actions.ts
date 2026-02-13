'use server'

import { Client } from '@notionhq/client';
import Groq from 'groq-sdk';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Groqクライアントの初期化
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function addToNotion(formData: FormData) {
  const text = formData.get('text');

  if (!process.env.NOTION_DATABASE_ID) {
    throw new Error('NOTION_DATABASE_ID is not defined');
  }

  if (typeof text !== 'string' || text.length === 0) {
    return;
  }

  let title = text; // デフォルトは元のテキスト
  let tags: string[] = []; // タグ用の配列

  // デバッグ: 状況をターミナルに表示
  console.log('--- Debug Start ---');
  console.log('Original Text:', text);
  console.log('Groq API Key exists:', !!process.env.GROQ_API_KEY);

  // Groqが使えるならタイトルを自動生成する
  if (groq) {
    try {
      console.log('Calling Groq API (Llama 3.3)...');
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `以下のテキストを分析し、Notionページ用の「タイトル（20文字以内）」と「タグ（最大2つ）」を作成してください。
必ず以下のJSON形式のみを出力してください。Markdown記法や余計な説明は不要です。
{
  "title": "ここにタイトル",
  "tags": ["タグ1", "タグ2"]
}

テキスト: ${text}`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          // JSON部分だけを抽出してパースする（AIが余計な文字を含めた場合への対策）
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : content;
          const parsed = JSON.parse(jsonString);
          
          if (parsed.title) title = parsed.title;
          if (parsed.tags && Array.isArray(parsed.tags)) tags = parsed.tags;
          
          console.log('Groq Generated:', { title, tags });
        } catch (e) {
          console.error('JSON Parse Error:', e);
          // パース失敗時はそのままタイトルとして使う（フォールバック）
          if (!content.includes('{')) title = content.trim();
        }
      }
    } catch (e) {
      console.error('Groq generation failed:', e);
    }
  } else {
    console.log('Skipping Groq: API Key is missing.');
  }
  console.log('--- Debug End ---');

  try {
    await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        // Notionデータベースのタイトル列名（デフォルトは "Name" または "名前"）
        // もしエラーが出る場合は、Notion側の列名を "Name" に変更するか、ここを書き換えてください
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        // タグを追加（Notion側に "Tags" というマルチセレクト列が必要）
        Tags: {
          multi_select: tags.map((tag) => ({ name: tag })),
        },
      },
      // 本文として元のテキストを追加
      children: [
        {
          object: 'block',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      ],
    });
    console.log('Success: Saved to Notion');
  } catch (error) {
    console.error('Error: Failed to save to Notion', error);
    throw error;
  }
}