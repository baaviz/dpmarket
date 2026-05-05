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
    const autoEnrichThreshold = body.threshold || 90;

    // Fetch all Doha Apps
    const { data: dohaApps } = await supabase.from('apps_catalog').select('id, name');
    // Fetch all Ameer Apps
    const { data: ameerApps } = await supabase.from('ameer_catalog').select('*');

    if (!dohaApps || !ameerApps) {
        return NextResponse.json({ error: 'Failed to fetch catalogs' }, { status: 500 });
    }

    let exactMatches = 0;
    let partialMatches = 0;
    let enriched = 0;

    for (const dohaApp of dohaApps) {
        let bestMatch = null;
        let highestConfidence = 0;

        for (const ameerApp of ameerApps) {
            const confidence = AmeerEnrichmentService.calculateConfidence(dohaApp.name, ameerApp.name);
            if (confidence > highestConfidence) {
                highestConfidence = confidence;
                bestMatch = ameerApp;
            }
        }

        if (bestMatch && highestConfidence > 0) {
            // Upsert match
            await supabase.from('enrichment_matches').upsert({
                doha_app_id: dohaApp.id,
                ameer_app_id: bestMatch.id,
                confidence_score: highestConfidence,
                status: highestConfidence >= autoEnrichThreshold ? 'approved' : 'pending'
            }, {
                onConflict: 'doha_app_id,ameer_app_id'
            });

            if (highestConfidence === 100) exactMatches++;
            else partialMatches++;

            // Auto enrich if high confidence
            if (highestConfidence >= autoEnrichThreshold) {
                await supabase.from('apps_catalog').update({
                    source_icon_url: bestMatch.icon_url,
                    source_url: bestMatch.source_url,
                    source_provider: 'ameer',
                    external_id: bestMatch.external_id,
                    bundle_id: bestMatch.bundle_id,
                    version: bestMatch.version,
                    size: bestMatch.size,
                    features: bestMatch.features,
                    last_updated_at: bestMatch.last_updated_at,
                    // DO NOT UPDATE NAME OR SLUG to preserve Doha Plus primary identity
                }).eq('id', dohaApp.id);
                enriched++;
            }
        }
    }

    return NextResponse.json({
        success: true,
        stats: {
            dohaAppsCount: dohaApps.length,
            ameerAppsCount: ameerApps.length,
            exactMatches,
            partialMatches,
            enriched
        }
    });

  } catch (error: unknown) {
    console.error('Ameer Match error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
