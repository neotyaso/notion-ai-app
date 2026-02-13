// app/api/notion/route.ts

import { NextResponse } from "next/server";
import { addToNotion } from "../../actions";

// 共通のCORSヘッダー
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // ここにContent-Typeを明記
};

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const formData = new FormData();
    formData.append('text', text);

    await addToNotion(formData);

    return NextResponse.json({ message: "Success" }, {
      status: 200,
      headers: corsHeaders, // CORSヘッダーを適用
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// プリフライトリクエスト（事前確認）への応答
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}