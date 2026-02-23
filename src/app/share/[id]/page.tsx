import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Share2, Home } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

type Props = {
    params: Promise<{ id: string }>;
};

// Generate Dynamic OGP Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    if (!supabaseUrl) return { title: 'Not Configured' };

    const { data } = await supabase.from('shared_gifs').select('*').eq('id', id).single();

    if (!data) {
        return { title: 'Not Found | Kif2Gif Web' };
    }

    const title = `${data.title} | Kif2Gif Web`;
    const description = 'ブラウザ上で将棋の棋譜（.kif/.jkf等）から自動生成された動くGIFアニメーションです。';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: data.gif_url,
                    width: 640,
                    height: 640,
                    alt: data.title,
                },
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [data.gif_url],
        },
    };
}

export default async function SharePage({ params }: Props) {
    const { id } = await params;

    if (!supabaseUrl) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <h1 className="text-2xl font-bold">Supabase Not Configured</h1>
                <p className="mt-4 text-zinc-500">環境変数が設定されていません。</p>
            </div>
        );
    }

    const { data } = await supabase.from('shared_gifs').select('*').eq('id', id).single();

    if (!data) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12 flex flex-col items-center min-h-[80vh] justify-center">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
                        {data.title}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                        {new Date(data.created_at || Date.now()).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} に生成
                    </p>
                </div>

                <div className="rounded-xl overflow-hidden shadow-inner border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-2 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={data.gif_url}
                        alt={data.title}
                        className="w-full max-w-[500px] h-auto object-contain rounded-lg"
                        loading="lazy"
                    />
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href={data.gif_url}
                        download={`shogi-${id}.gif`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-medium transition-colors"
                    >
                        <Download size={18} />
                        GIFをダウンロード
                    </a>

                    <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://kif2gif-web.vercel.app/share/${id}`)}&text=${encodeURIComponent(`将棋の棋譜からGIF画像を作成しました！ ${data.title}\n`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl font-medium transition-colors"
                    >
                        <Share2 size={18} />
                        X (Twitter) でシェア
                    </a>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors">
                        <Home size={18} />
                        トップページに戻って新しいGIFを作る
                    </Link>
                </div>
            </div>
        </div>
    );
}
