import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Github, Share2 } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kif2Gif Web | 将棋棋譜を動くGIFに変換",
  description: "ブラウザ上で将棋の棋譜ファイル（.kif等）を読み込み、アニメーションGIFとして生成・シェアできるWebアプリケーション。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <Share2 size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">Kif2Gif</span>
            </div>
            <nav className="flex items-center gap-4">
              <a
                href="https://github.com/misorange/kif2gif"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 hover:text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <Github size={20} />
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Kif2Gif Web. Built for Portfolio.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
