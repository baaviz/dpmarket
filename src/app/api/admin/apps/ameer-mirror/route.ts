import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time 60s

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set(name, value, options); },
          remove(name: string, options: CookieOptions) { cookieStore.set(name, '', { ...options, maxAge: 0 }); },
        },
      }
    );
    
    // Check admin auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('id, is_active')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_active) return NextResponse.json({ error: 'Unauthorized admin' }, { status: 403 });

    const body = await request.json();
    const batchSize = body.batchSize || 50;

    // Fetch apps that have a source_icon_url but no icon_storage_path
    const { data: appsToMirror } = await supabase
        .from('apps_catalog')
        .select('id, slug, source_icon_url')
        .not('source_icon_url', 'is', null)
        .is('icon_storage_path', null)
        .limit(batchSize);

    if (!appsToMirror || appsToMirror.length === 0) {
        return NextResponse.json({ success: true, stats: { processed: 0, mirrored: 0, failed: 0 } });
    }

    let mirrored = 0;
    let failed = 0;

    for (const app of appsToMirror) {
        try {
            const response = await fetch(app.source_icon_url);
            if (!response.ok) throw new Error(`Failed to download icon: ${response.status}`);
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            const contentType = response.headers.get('content-type') || 'image/png';
            const ext = contentType.split('/')[1] || 'png';
            const fileName = `${app.slug}-${Date.now()}.${ext}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage bucket 'app-icons'
            const { error: uploadError } = await supabase.storage
                .from('app-icons')
                .upload(filePath, buffer, {
                    contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error(`Error uploading icon for ${app.slug}:`, uploadError);
                failed++;
                continue;
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('app-icons')
                .getPublicUrl(filePath);

            // Update DB
            await supabase.from('apps_catalog').update({
                icon_storage_path: publicUrlData.publicUrl
            }).eq('id', app.id);

            mirrored++;
        } catch (err) {
            console.error(`Failed to mirror icon for ${app.slug}:`, err);
            failed++;
        }
    }

    return NextResponse.json({
        success: true,
        stats: {
            processed: appsToMirror.length,
            mirrored,
            failed
        }
    });

  } catch (error: unknown) {
    console.error('Ameer Mirror error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
