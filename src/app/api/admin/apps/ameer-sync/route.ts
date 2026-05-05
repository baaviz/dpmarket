import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AmeerEnrichmentService } from '@/lib/services/ameer-enrichment';

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
    const urlsToProcess = body.urls || [];
    
    let processed = 0;
    let newApps = 0;
    let failed = 0;
    const importedApps = [];

    for (const url of urlsToProcess) {
        const appDetails = await AmeerEnrichmentService.parseAmeerAppDetails(url);
        if (appDetails) {
            // Upsert to ameer_catalog
            const slug = AmeerEnrichmentService.normalizeAppName(appDetails.name);
            const { error } = await supabase
                .from('ameer_catalog')
                .upsert({
                    external_id: appDetails.external_id,
                    name: appDetails.name,
                    slug: slug || appDetails.external_id,
                    description: appDetails.features ? appDetails.features.substring(0, 500) : '',
                    features: appDetails.features,
                    icon_url: appDetails.icon_url,
                    source_url: appDetails.source_url,
                    bundle_id: appDetails.bundle_id,
                    version: appDetails.version,
                    size: appDetails.size,
                    last_updated_at: appDetails.last_updated_at ? new Date(appDetails.last_updated_at).toISOString() : null,
                }, {
                    onConflict: 'external_id'
                });

            if (error) {
                console.error(`Error saving ameer app ${appDetails.name}:`, error);
                failed++;
            } else {
                newApps++;
                importedApps.push(appDetails);
            }
        } else {
            failed++;
        }
        processed++;
    }

    return NextResponse.json({
        success: true,
        stats: {
            processed,
            newApps,
            failed
        },
        importedApps
    });

  } catch (error: unknown) {
    console.error('Ameer Sync error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
