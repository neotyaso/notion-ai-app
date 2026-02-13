import { NextResponse } from "next/server";
import { addToNotion } from "../../actions";

// 共通のCORSヘッダー
// セキュリティ強化のため、"X-KOKI-TOKEN" を Allow-Headers に追加する必要があります
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-KOKI-TOKEN",
};

export async function POST(req: Request) {
  try {
    // 1. ヘッダーから合言葉（トークン）を取り出す
    const clientToken = req.headers.get("X-KOKI-TOKEN");

    // 2. Vercelの環境変数に設定した合言葉と一致するかチェック
    if (clientToken !== process.env.MY_PRIVATE_TOKEN) {
      console.error("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const { text } = await req.json();
    const formData = new FormData();
    formData.append('text', text);

    await addToNotion(formData);

    return NextResponse.json({ message: "Success" }, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}