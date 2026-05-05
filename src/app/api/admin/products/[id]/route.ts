import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/server/services/admin/admin-auth.service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name_ar, name_en, slug, description_ar, description_en, price, currency, type, is_active, category_id } = body;

        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from('products')
            .update({
                name: { ar: name_ar, en: name_en },
                slug,
                description: { ar: description_ar, en: description_en },
                price: Number(price),
                currency,
                type,
                is_active,
                category_id: category_id || null,
                image_url: body.image_url || null,
                purchase_link: body.purchase_link || null,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Handle Codes if provided in update
        if (body.codes_raw && body.codes_raw.trim()) {
            const codes = body.codes_raw.split('\n').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
            if (codes.length > 0) {
                const crypto = await import('crypto');
                const { data: batch } = await supabase
                    .from('inventory_batches')
                    .insert({
                        product_id: id,
                        title: `تحديث مخزون - ${new Date().toLocaleDateString('ar-KW')}`,
                        total_count: codes.length,
                        available_count: codes.length,
                        created_by: session.userId
                    })
                    .select().single();

                const inventoryRecords = codes.map((code: string) => ({
                    product_id: id,
                    batch_id: batch?.id,
                    encrypted_code: code,
                    code_hash: crypto.createHash('sha256').update(code).digest('hex'),
                    status: 'available',
                    created_by: session.userId
                }));

                await supabase.from('inventory_codes').insert(inventoryRecords);
            }
        }

        return NextResponse.json({ success: true, product: data });
    } catch (error: any) {
        console.error('PATCH API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
