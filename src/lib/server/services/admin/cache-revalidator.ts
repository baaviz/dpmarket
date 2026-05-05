import { revalidateTag } from 'next/cache';

export function revalidatePublicCache() {
    // @ts-expect-error Next.js 16 alpha types mismatch
    revalidateTag('home');
    // @ts-expect-error Next.js 16 alpha types mismatch
    revalidateTag('products');
    // @ts-expect-error Next.js 16 alpha types mismatch
    revalidateTag('apps');
    // @ts-expect-error Next.js 16 alpha types mismatch
    revalidateTag('settings');
    // @ts-expect-error Next.js 16 alpha types mismatch
    revalidateTag('pages');
}
