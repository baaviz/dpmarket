const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('scratch_apps.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const apps = [];

// The user mentioned "التطبيقات المتوفرة" and "##### اسم التطبيق"
// Let's look for h5 elements, as they seem to represent the app names based on the prompt.
const h5Elements = Array.from(document.querySelectorAll('h5'));

// If no h5 elements, maybe they are in standard cards. Let's check card titles.
const cards = document.querySelectorAll('.card, .app-card');
if (cards.length > 0) {
    cards.forEach(card => {
        const titleEl = card.querySelector('h1, h2, h3, h4, h5, .title, .name');
        const imgEl = card.querySelector('img');
        const descEl = card.querySelector('p, .description');
        
        if (titleEl) {
            apps.push({
                name: titleEl.textContent.trim(),
                icon: imgEl ? (imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original')) : null,
                desc: descEl ? descEl.textContent.trim() : ''
            });
        }
    });
} else {
    // Let's look for images followed by headers, or just headers
    // The user said: "كل تطبيق غالبا يبدأ بـ ##### اسم التطبيق"
    // Which means it was rendered from markdown into h5.
    h5Elements.forEach((h5, index) => {
        const name = h5.textContent.trim();
        let desc = '';
        let icon = null;
        
        // Find previous sibling image
        let prev = h5.previousElementSibling;
        while(prev && prev.tagName !== 'H5') {
            if (prev.tagName === 'IMG') icon = prev.src;
            else {
                const img = prev.querySelector('img');
                if (img) icon = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
            }
            prev = prev.previousElementSibling;
        }

        // Find next sibling description until next h5
        let next = h5.nextElementSibling;
        while(next && next.tagName !== 'H5') {
            if (next.tagName === 'IMG' && !icon) {
                 icon = next.src || next.getAttribute('data-src') || next.getAttribute('data-original');
            }
            desc += ' ' + next.textContent.trim();
            next = next.nextElementSibling;
        }
        
        apps.push({ name, icon, desc: desc.trim().substring(0, 150) });
    });
}

console.log('Apps found via DOM:', apps.length);
if (apps.length > 0) {
    console.log('Sample 1:', apps[0]);
    console.log('Sample 50:', apps[49] || apps[apps.length -1]);
} else {
    // Let's just grab the text and do a raw regex for the image tags
    console.log('No apps found using standard DOM traversal. The HTML might be different.');
}
