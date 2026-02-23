# Kif2Gif Web ☖

将棋の棋譜ファイル（`.kif`, `.kifu`, `.ki2`, `.jkf`）をブラウザ上で読み込み、美しい動くGIFアニメーションとして生成・シェアできるWebアプリケーションです。

🌐 **Live Demo:** [https://your-vercel-project.vercel.app](https://your-vercel-project.vercel.app)

![Home Screen](./docs/screenshot1.png)

## ✨ 主な機能

*   **ドラッグ＆ドロップで簡単生成:** `.kif` ファイルをアップロードするだけで、盤面の推移を自動でアニメーション化。
*   **Web Workerによる高速エンコード:** メインスレッドをブロックせず、バックグラウンドでスムーズにGIFを生成（`gif.js` 採用）。
*   **プレビュー＆プレイヤー機能:** GIFをエクスポートする前に、ブラウザ上で1手ずつ再生・確認が可能。
*   **モダン＆ミニマルなUI:** Tailwind CSS を駆使したダークモード対応の没入感のあるデザイン。
*   **OGPシェア対応:** 生成されたGIFは専用のURLとして発行され、X (Twitter) などのSNSでカード付きで展開可能。
*   **Supabase 停止回避 (Ping処理):** 無料枠のSupabaseプロジェクトが一定期間の非アクティブで停止するのを防ぐため、GitHub Actionsを用いて定期的なPing送信を自動化。

## 📸 スクリーンショット

| トップ画面 (Kifu入力) | プレビュー＆プレイヤー | GIF生成中 (プログレス) | 
| :---: | :---: | :---: | 
| ![Top](./docs/screenshot1.png) | ![Preview](./docs/screenshot2.png) | ![Generating](./docs/screenshot3.png) |

| シェアページ (OGP表示) | OGP Twitter プレビュー |
| :---: | :---: |
| ![Share](./docs/screenshot4.png) | ![Twitter](./docs/screenshot5.png) |

*(※スクリーンショットの画像は `docs/` ディレクトリに配置してください)*

## 💻 使用技術 / アーキテクチャ

*   **フロントエンド:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React
*   **バックエンド / インフラ:** Vercel (Hosting, Serverless Functions)
*   **データベース / ストレージ:** Supabase (PostgreSQL, Supabase Storage)
*   **棋譜解析:** `json-kifu-format`
*   **画像生成エンジン:** HTML5 Canvas API + `gif.js` (Web Worker)
*   **CI/CD:** GitHub Actions (Ping自動化), Vercel

## 🚀 ローカルでの動かし方

### 1. リポジトリのクローンと依存パッケージのインストール

```bash
git clone https://github.com/your-username/kif2gif.git
cd kif2gif
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、SupabaseのURLとキーを入力します。

```bash
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# RLS設定に応じてサービスロールキーが必要な場合があります
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase テーブル・バケットの準備

1.  **Storage:** `gifs` という名前の「Public」バケットを作成します。
2.  **Database:** `shared_gifs` テーブルを作成します。
    ```sql
    create table shared_gifs (
      id uuid primary key default uuid_generate_v4(),
      title text not null default '将棋 GIF',
      gif_url text not null,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    ```

### 4. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてアプリケーションを開きます。

## 💡 工夫した点

1.  **CanvasとWeb Workerの分離:** パフォーマンス向上のため、Canvasへのコマごとの描画と、重いGIFエンコード処理を分離。`gif.worker.js` を Public フォルダに配置し、非同期でエンコードを行うことで、プログレスバーのアニメーション中もUIがカクつかないようにしました。
2.  **Shift-JISへの対応:** 既存の将棋ソフト等で出力される `.kif` は Shift-JIS エンコーディングであることが多いため、`TextDecoder` で文字化けを防ぐフォールバック処理をクライアントサイドで実装しています。
3.  **App Router を最大限に活用した動的OGP:** `/share/[id]` パスで `generateMetadata` を利用してSupabaseからメタデータと画像URLを取得し、動的なTwitter Cardを生成するようにしました。

## ⏱️ 開発期間
約 **25** 時間

---

© 2026 Kif2Gif Web. Created for Portfolio.
