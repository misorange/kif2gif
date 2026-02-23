import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
// This route can use the SERVICE ROLE KEY if the anon key doesn't have insert permissions without auth.
// Alternatively, it uses anon key if public insert is enabled.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string || '将棋 GIF';

        if (!file) {
            return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 });
        }

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Supabase設定が未完了です。環境変数を設定してください。' }, { status: 500 });
        }

        const fileId = crypto.randomUUID();
        const fileName = `${fileId}.gif`;

        // 1. Upload to Supabase Storage ('gifs' bucket)
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('gifs')
            .upload(fileName, file, {
                contentType: 'image/gif',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            return NextResponse.json({ error: '画像のアップロードに失敗しました' }, { status: 500 });
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('gifs').getPublicUrl(fileName);

        // 3. Insert into Database ('shared_gifs' table)
        const { data: dbData, error: dbError } = await supabase
            .from('shared_gifs')
            .insert({
                id: fileId,
                title: title,
                gif_url: publicUrl
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database Insert Error:', dbError);
            return NextResponse.json({ error: 'データベースへの保存に失敗しました' }, { status: 500 });
        }

        return NextResponse.json({ id: fileId, url: publicUrl });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: '予期せぬエラーが発生しました' }, { status: 500 });
    }
}
