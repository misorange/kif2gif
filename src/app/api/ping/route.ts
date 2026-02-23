import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent caching in Vercel. We want this hit to always reach the DB.
export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ status: 'ignored', message: 'No Supabase configuration found' }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Perform a lightweight query to keep the database active
        const { data, error } = await supabase.from('shared_gifs').select('id').limit(1);

        if (error) {
            console.error('Ping DB Error:', error);
            throw error;
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Supabase instance pinged successfully to prevent pausing.',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
