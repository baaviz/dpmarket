import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/server/services/admin/admin-auth.service';
import { revalidatePublicCache } from '@/lib/server/services/admin/cache-revalidator';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        if (body.tags && Array.isArray(body.tags)) {
            body.tags.forEach((tag: string) => {
                // @ts-expect-error Next.js 16 alpha types mismatch
                revalidateTag(tag);
            });
        } else {
            revalidatePublicCache();
        }

        return NextResponse.json({ success: true, message: 'Cache revalidated successfully' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
