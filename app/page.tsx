import { addToNotion } from "./actions";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex w-full max-w-md flex-col items-center gap-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Notion連携テスト (Step 1)
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          ここに入力して送信すると、<br />あなたのNotionデータベースに追加されます。
        </p>
        
        <form action={addToNotion} className="flex flex-col gap-4 w-full">
          <textarea
            name="text"
            className="p-4 border rounded-lg text-black bg-gray-50 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="メモしたい内容を入力..."
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95"
          >
            Notionに送信
          </button>
        </form>
      </main>
    </div>
  );
}
