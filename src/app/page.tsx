"use client";

import { useState } from "react";
import KifuUploader from "@/components/KifuUploader";
import dynamic from "next/dynamic";
import { parseKifuFile } from "@/lib/kifu-parser";
import { JKFPlayer } from "json-kifu-format";

const ShogiBoard = dynamic(() => import("@/components/ShogiBoard"), { ssr: false });

export default function Home() {
  const [player, setPlayer] = useState<JKFPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedPlayer = await parseKifuFile(file);
      setPlayer(parsedPlayer);
    } catch (err: any) {
      setError(err.message || "予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20 flex flex-col items-center">
      <div className="mx-auto max-w-2xl text-center mt-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          将棋の棋譜を<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">
            動くGIF
          </span>
          に変換しよう。
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          .kif ファイルをアップロードするだけで、盤面の推移を美しいアニメーションGIFとして自動生成。
          SNS（X/Twitter等）で簡単にシェアできます。
        </p>
      </div>

      <div className="mt-16 w-full flex justify-center pb-24">
        {error && (
          <div className="w-full max-w-2xl bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center shadow-sm">
            {error}
          </div>
        )}

        {!player ? (
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <KifuUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          <div className="w-full flex justify-center animate-in zoom-in-95 duration-500">
            <ShogiBoard player={player} onClose={() => setPlayer(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
