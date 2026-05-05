const fs = require('fs');
const html = fs.readFileSync('scratch_apps.html', 'utf8');

// Looking for typical app entries, maybe they are in a specific div.
const appsMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>\s*<h5[^>]*>(.*?)<\/h5>/gi);

console.log('Found with h5:', appsMatch ? appsMatch.length : 0);

if (appsMatch && appsMatch.length > 0) {
  console.log('Sample 1:', appsMatch[0]);
  console.log('Sample 2:', appsMatch[1]);
}

// Let's also just look for ##### if it was markdown, but since it's HTML, let's find the card structures.
// The user mentioned "https://ipa.ameer.app/storage"
const imgMatch = html.match(/https:\/\/ipa\.ameer\.app\/storage[^"'\s]+/gi);
console.log('Found images from ipa.ameer.app/storage:', imgMatch ? imgMatch.length : 0);

if (imgMatch && imgMatch.length > 0) {
  console.log('Sample Imgs:', imgMatch.slice(0, 3));
}
