const fs = require('fs');
const { JSDOM } = require('jsdom');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const html = fs.readFileSync('scratch_apps.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const h5Elements = Array.from(document.querySelectorAll('h5'));
const rawApps = [];

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
            if (prev.tagName === 'IMG') icon_url = prev.src;
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
            icon_url = next.src || next.getAttribute('data-src') || next.getAttribute('data-original');
        }
        desc += ' ' + (next.textContent?.trim() || '');
        next = next.nextElementSibling;
    }
    
    rawApps.push({ name, icon_url, description: desc.trim().substring(0, 500) });
});

const uniqueAppsMap = new Map();
let missingIcons = 0;

for (const app of rawApps) {
    if (!app.name) continue;
    
    // Clean up name
    app.name = app.name.replace(/^#+\s*/, '').trim();
    if (app.name === 'التطبيقات المتوفرة' || app.name === 'التطبيقات') continue;

    const slug = generateSlug(app.name);
    if (!uniqueAppsMap.has(slug)) {
        app.slug = slug;
        if (!app.icon_url) missingIcons++;
        uniqueAppsMap.set(slug, app);
    }
}

const uniqueApps = Array.from(uniqueAppsMap.values());
console.log('Total Parsed (raw):', rawApps.length);
console.log('Total Unique Apps:', uniqueApps.length);
console.log('Missing Icons (in unique):', missingIcons);
