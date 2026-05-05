import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { JSDOM } from 'jsdom';

export const dynamic = 'force-dynamic';
// Max duration allowed by Vercel Hobby is 10s, Pro is 60s/300s. We will use a safe batch approach on the client.
export const maxDuration = 60; 

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferCategory(name: string, desc: string): string {
  const text = (name + ' ' + desc).toLowerCase();
  if (text.includes('لعبة') || text.includes('game') || text.includes('hack') || text.includes('pubg') || text.includes('call of duty')) return 'ألعاب';
  if (text.includes('واتساب') || text.includes('سناب') || text.includes('انستقرام') || text.includes('تويتر') || text.includes('تيك توك') || text.includes('social')) return 'تواصل';
  if (text.includes('تصوير') || text.includes('كاميرا') || text.includes('فيديو') || text.includes('photo') || text.includes('video')) return 'تصوير';
  if (text.includes('vpn') || text.includes('بروكسي')) return 'VPN';
  if (text.includes('يوتيوب') || text.includes('نتفلكس') || text.includes('شاهد') || text.includes('movie') || text.includes('watch')) return 'مشاهدة';
  if (text.includes('انتاج') || text.includes('تعديل') || text.includes('pdf')) return 'إنتاجية';
  if (text.includes('اداة') || text.includes('tool') || text.includes('مدير')) return 'أدوات';
  if (text.includes('كورة') || text.includes('رياضة') || text.includes('sport')) return 'رياضة';
  return 'أخرى';
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    );
    
    // Check admin auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('id, is_active')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_active) {
      return NextResponse.json({ error: 'Unauthorized admin' }, { status: 403 });
    }

    const body = await request.json();
    const batchSize = body.batchSize || 250;
    const offset = body.offset || 0;

    let apps = [];

    // ONLY FETCH AND PARSE HTML ON THE FIRST BATCH to avoid massive memory usage repeatedly.
    // However, since it's stateless, the client should ideally pass the parsed apps OR we fetch once.
    // If the client passes the parsed apps directly in `body.appsToSync`, we just sync them.
    if (body.appsToSync && Array.isArray(body.appsToSync)) {
        apps = body.appsToSync;
    } else {
        // Fallback: Fetch and parse if not provided by client (the client is better suited to parse the massive HTML to avoid 60s timeout limit)
        const response = await fetch('https://doha-plus.com/Apps');
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const h5Elements = Array.from(document.querySelectorAll('h5'));
        const cards = document.querySelectorAll('.card, .app-card');
        
        const rawApps: Record<string, unknown>[] = [];

        if (cards.length > 0) {
            cards.forEach(card => {
                const titleEl = card.querySelector('h1, h2, h3, h4, h5, .title, .name');
                const imgEl = card.querySelector('img');
                const descEl = card.querySelector('p, .description');
                
                if (titleEl) {
                    rawApps.push({
                        name: titleEl.textContent?.trim() || '',
                        icon_url: imgEl ? (imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original')) : null,
                        description: descEl ? descEl.textContent?.trim() : ''
                    });
                }
            });
        } else {
            h5Elements.forEach((h5) => {
                const spanName = h5.querySelector('span');
                const name = (spanName ? spanName.textContent : h5.textContent)?.trim() || '';
                if (!name || name === 'التطبيقات المتوفرة' || name === 'التطبيقات') return;

                let desc = '';
                let icon_url = null;
                
                // Image might be inside h5
                const imgInside = h5.querySelector('img');
                if (imgInside) {
                    icon_url = imgInside.src || imgInside.getAttribute('data-src') || imgInside.getAttribute('data-original');
                } else {
                    let prev = h5.previousElementSibling;
                    while(prev && prev.tagName !== 'H5') {
                        if (prev.tagName === 'IMG') icon_url = (prev as HTMLImageElement).src;
                        else {
                            const img = prev.querySelector('img');
                            if (img) icon_url = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
                        }
                        prev = prev.previousElementSibling;
                    }
                }

                let next = h5.nextElementSibling;
                while(next && next.tagName !== 'H5') {
                    if (next.tagName === 'IMG' && !icon_url) {
                        icon_url = (next as HTMLImageElement).src || next.getAttribute('data-src') || next.getAttribute('data-original');
                    }
                    desc += ' ' + (next.textContent?.trim() || '');
                    next = next.nextElementSibling;
                }
                
                rawApps.push({ name, icon_url, description: desc.trim().substring(0, 500) });
            });
        }

        // Deduplicate
        const uniqueAppsMap = new Map();
        for (const rawApp of rawApps) {
            const app = rawApp as Record<string, unknown>;
            if (!app.name || typeof app.name !== 'string') continue;
            
            // Clean up name, remove '#####' if present
            app.name = app.name.replace(/^#+\s*/, '').trim();
            if (app.name === 'التطبيقات المتوفرة' || app.name === 'التطبيقات') continue;

            const slug = generateSlug(app.name as string);
            if (!uniqueAppsMap.has(slug)) {
                app.slug = slug;
                app.category = inferCategory(app.name as string, app.description as string);
                app.synced_from = 'doha-plus.com';
                app.is_active = true;
                uniqueAppsMap.set(slug, app);
            }
        }

        apps = Array.from(uniqueAppsMap.values());
    }

    const totalParsed = apps.length;
    
    // Slice for this batch
    const batchApps = apps.slice(offset, offset + batchSize);
    
    let updated = 0;
    let skipped = 0;
    let missingIcons = 0;

    for (const app of batchApps) {
        if (!app.icon_url) missingIcons++;

        // Upsert into Supabase
        const { error } = await supabase
            .from('apps_catalog')
            .upsert({
                name: app.name,
                slug: app.slug,
                description: app.description,
                category: app.category,
                icon_url: app.icon_url,
                last_synced_at: new Date().toISOString(),
                is_active: true
            }, {
                onConflict: 'slug',
                ignoreDuplicates: false // We want to update existing
            });

        if (error) {
            console.error('Error upserting app:', error);
            skipped++;
        } else {
            updated++;
        }
    }

    const hasMore = offset + batchSize < totalParsed;

    // Log if it's the final batch
    if (!hasMore) {
        await supabase.from('apps_sync_log').insert({
            sync_source: 'doha-plus.com',
            status: 'success',
            apps_found: totalParsed,
            apps_imported: updated, // approximation
            apps_updated: updated,
            triggered_by: profile.id
        });
    }

    return NextResponse.json({
        success: true,
        stats: {
            totalParsed,
            batchSize,
            processedThisBatch: batchApps.length,
            missingIcons,
            skipped,
            updated
        },
        hasMore,
        nextOffset: offset + batchSize,
        totalApps: apps // Only returning this if the client needs to hold the state, but we should clear it if it's huge
    });

  } catch (error: unknown) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
