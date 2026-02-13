import { NextResponse } from "next/server";
import { addToNotion } from "../../actions";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // actions.ts が期待している FormData を擬似的に作成する
    const formData = new FormData();
    formData.append('text', text);

    // actions.ts の関数を呼び出す
    await addToNotion(formData);

    return NextResponse.json({ message: "Success" }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}