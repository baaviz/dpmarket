import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

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

function makeAbsoluteUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `https://doha-plus.com${url}`;
    return `https://doha-plus.com/${url}`;
}

async function buildSnapshot() {
    console.log('Fetching https://doha-plus.com/Apps...');
    const response = await fetch('https://doha-plus.com/Apps');
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const h5Elements = Array.from(document.querySelectorAll('h5'));
    const rawApps: Record<string, any>[] = [];

    h5Elements.forEach((h5) => {
        const spanName = h5.querySelector('span');
        let name = (spanName ? spanName.textContent : h5.textContent)?.trim() || '';
        name = name.replace(/^#+\s*/, '').trim();

        if (!name || name === 'التطبيقات المتوفرة' || name === 'التطبيقات') return;

        let desc = '';
        let icon_url = null;
        
        // Find icon BEFORE or INSIDE h5
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
                if (icon_url) break;
                prev = prev.previousElementSibling;
            }
        }

        // Find desc and icon AFTER h5
        let next = h5.nextElementSibling;
        while(next && next.tagName !== 'H5') {
            if (next.tagName === 'IMG' && !icon_url) {
                icon_url = (next as HTMLImageElement).src || next.getAttribute('data-src') || next.getAttribute('data-original');
            } else {
                const img = next.querySelector('img');
                if (img && !icon_url) icon_url = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
            }
            desc += ' ' + (next.textContent?.trim() || '');
            next = next.nextElementSibling;
        }
        
        rawApps.push({ 
            name, 
            icon_url: makeAbsoluteUrl(icon_url), 
            description: desc.trim().substring(0, 500) 
        });
    });

    const uniqueAppsMap = new Map();
    for (const app of rawApps) {
        const slug = generateSlug(app.name);
        if (!uniqueAppsMap.has(slug)) {
            app.slug = slug;
            app.category = inferCategory(app.name, app.description);
            app.source_provider = 'doha-plus';
            app.is_active = true;
            uniqueAppsMap.set(slug, app);
        }
    }

    const finalApps = Array.from(uniqueAppsMap.values());
    console.log(`Found ${finalApps.length} unique apps.`);

    const outputPath = path.join(process.cwd(), 'src', 'data', 'doha-apps-snapshot.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalApps, null, 2), 'utf-8');
    console.log(`Snapshot saved to ${outputPath}`);
}

buildSnapshot().catch(console.error);
