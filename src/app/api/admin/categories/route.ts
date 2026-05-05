import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/server/services/admin/admin-auth.service';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name_ar, name_en, slug, description_ar, description_en } = body;

        if (!name_ar || !slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        
        const { data, error } = await supabase
            .from('product_categories')
            .insert({
                name: { ar: name_ar, en: name_en },
                slug,
                description: { ar: description_ar, en: description_en },
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, category: data });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
