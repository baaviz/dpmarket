import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/server/services/admin/admin-auth.service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized - يرجى تسجيل الدخول' }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { 
            name_ar, name_en, slug, description_ar, description_en, 
            price, currency, type, is_active, category_id, codes_raw 
        } = body;

        // Logging for debugging
        console.log('Creating product with:', { name_ar, slug, price, type });

        // Robust Validation
        if (!name_ar || !slug) {
            return NextResponse.json({ error: 'يرجى إدخال اسم المنتج والرابط (Slug)' }, { status: 400 });
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return NextResponse.json({ error: 'يرجى إدخال سعر صحيح للمنتج' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        
        // 1. Create the Product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                name: { ar: name_ar, en: name_en || name_ar },
                slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
                description: { ar: description_ar, en: description_en || description_ar },
                price: numericPrice,
                currency: currency || 'KWD',
                type: type || 'activation_code',
                is_active: is_active ?? true,
                category_id: category_id || null,
                delivery_type: 'code',
                requires_mobile: true,
                image_url: body.image_url || null
            })
            .select()
            .single();

        if (productError) {
            console.error('Supabase Product Error:', productError);
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        // 2. Handle Codes if provided
        if (codes_raw && codes_raw.trim()) {
            const codes = codes_raw.split('\n').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
            
            if (codes.length > 0) {
                // Create a batch
                const { data: batch, error: batchError } = await supabase
                    .from('inventory_batches')
                    .insert({
                        product_id: product.id,
                        title: `شحنة أولية - ${new Date().toLocaleDateString('ar-KW')}`,
                        total_count: codes.length,
                        available_count: codes.length,
                        created_by: session.userId
                    })
                    .select()
                    .single();

                if (batchError) {
                    console.error('Batch Error:', batchError);
                    // We don't fail the whole request if batch fails, but we should log it
                }

                // Prepare inventory records
                // In a real app, we would ENCRYPT the code. For now, we'll store it as is (or base64) since we don't have the encryption key configured yet.
                // But we MUST provide a hash for code_hash.
                const inventoryRecords = codes.map((code: string) => {
                    const hash = crypto.createHash('sha256').update(code).digest('hex');
                    return {
                        product_id: product.id,
                        batch_id: batch?.id,
                        encrypted_code: code, // TODO: Add real AES encryption
                        code_hash: hash,
                        status: 'available',
                        created_by: session.userId
                    };
                });

                const { error: inventoryError } = await supabase
                    .from('inventory_codes')
                    .insert(inventoryRecords);

                if (inventoryError) {
                    console.error('Inventory Error:', inventoryError);
                    // If this fails, we might have duplicate codes or schema issues
                    return NextResponse.json({ 
                        error: 'تم إنشاء المنتج بنجاح، لكن فشل استيراد الأكواد. يرجى مراجعة المخزون.',
                        product_id: product.id 
                    }, { status: 207 }); // Multi-status/Partial success
                }
            }
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('API Final Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
