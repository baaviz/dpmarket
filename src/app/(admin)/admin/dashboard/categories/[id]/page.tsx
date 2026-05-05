import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import CategoryEditForm from './category-edit-form';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    const { data: category } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!category) {
        notFound();
    }

    return <CategoryEditForm category={category} />;
}
