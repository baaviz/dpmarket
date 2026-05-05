import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ProductEditForm from './product-edit-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        console.error('Error fetching product:', error);
        notFound();
    }

    return <ProductEditForm product={product} />;
}
