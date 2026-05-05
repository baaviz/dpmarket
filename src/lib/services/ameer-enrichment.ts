import { JSDOM } from 'jsdom';

export interface AmeerAppInfo {
    external_id: string;
    name: string;
    icon_url: string;
    source_url: string;
    version?: string;
    bundle_id?: string;
    size?: string;
    last_updated_at?: string;
    features?: string;
}

export class AmeerEnrichmentService {
    static async fetchAmeerAppsList(baseUrl: string = 'https://ipa.ameer.app'): Promise<string[]> {
        const linksToCrawl: Set<string> = new Set();
        try {
            // Fetch homepage
            const response = await fetch(baseUrl);
            if (!response.ok) throw new Error(`Failed to fetch Ameer homepage: ${response.status}`);
            const html = await response.text();
            
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            
            // Extract all app links
            doc.querySelectorAll('a').forEach(a => {
                if (a.href && a.href.includes('/app/')) {
                    // Ensure absolute url
                    const absoluteUrl = new URL(a.href, baseUrl).toString();
                    linksToCrawl.add(absoluteUrl);
                }
            });

            // If there's a view all button or pagination
            // (Ameer typically loads everything on the home or has infinite scroll via API, but for a simple scraper we grab all visible links)
            
            return Array.from(linksToCrawl);
        } catch (error) {
            console.error('Error fetching Ameer apps list:', error);
            return [];
        }
    }

    static async parseAmeerAppDetails(url: string): Promise<AmeerAppInfo | null> {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const html = await response.text();
            
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            
            // Extract external ID from URL
            const urlParts = url.split('/');
            const external_id = urlParts[urlParts.length - 1];
            if (!external_id) return null;

            // Extract Name
            // Ameer app names are usually in a large h5 or h2 tag
            let name = '';
            const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            for (const h of headings) {
                const text = h.textContent?.trim();
                // Avoid generic headings
                if (text && text.length > 2 && text.length < 50 && !['Links', 'IPA AMEER'].includes(text)) {
                    name = text;
                    break;
                }
            }

            // Extract Icon
            let icon_url = '';
            const images = Array.from(doc.querySelectorAll('img'));
            // The app icon is usually the first large image or has a specific class like AppIcon or is in /storage/
            for (const img of images) {
                const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
                if (src && (src.includes('/storage/') || src.includes('icon'))) {
                    // ignore the site logo
                    if (!src.includes('ipa_ameer.png') && !src.includes('logo_seipa')) {
                        icon_url = new URL(src, url).toString();
                        break;
                    }
                }
            }

            // Extract Details
            let version = '';
            let bundle_id = '';
            let size = '';
            let last_updated_at = '';
            let features = '';

            const listItems = Array.from(doc.querySelectorAll('li, p, div'));
            listItems.forEach(el => {
                const text = el.textContent?.trim() || '';
                const lowerText = text.toLowerCase();
                
                if (lowerText.includes('version :')) {
                    version = text.split(':')[1]?.trim() || '';
                } else if (lowerText.includes('bundle :') || lowerText.includes('bundle id')) {
                    bundle_id = text.split(':')[1]?.trim() || '';
                } else if (lowerText.includes('size :')) {
                    size = text.split(':')[1]?.trim() || '';
                } else if (lowerText.includes('last updated :')) {
                    last_updated_at = text.split(' : ')[1]?.trim() || '';
                }
            });

            // Features are usually in a paragraph after "Overview" or in a div
            let isReadingFeatures = false;
            const featuresText = [];
            for (const el of listItems) {
                const text = el.textContent?.trim() || '';
                if (text.toLowerCase() === 'overview') {
                    isReadingFeatures = true;
                    continue;
                }
                
                if (isReadingFeatures) {
                    if (text.toLowerCase().includes('last updated')) break;
                    if (text.length > 5) {
                        featuresText.push(text);
                    }
                }
            }
            features = featuresText.join('\n').trim();

            if (!name) return null;

            return {
                external_id,
                name,
                icon_url,
                source_url: url,
                version,
                bundle_id,
                size,
                last_updated_at,
                features
            };
        } catch (error) {
            console.error(`Error parsing Ameer app details from ${url}:`, error);
            return null;
        }
    }

    static normalizeAppName(name: string): string {
        return name
            .toLowerCase()
            .replace(/enjoy|hack|plus|root|zero|sat|dl|bh/g, '') // remove common modifiers
            .replace(/[^\w\s\u0600-\u06FF]/g, '') // keep alphanumeric and arabic characters, remove symbols
            .replace(/\s+/g, '') // remove all spaces for strict comparison
            .trim();
    }

    static calculateConfidence(dohaName: string, ameerName: string): number {
        const normDoha = this.normalizeAppName(dohaName);
        const normAmeer = this.normalizeAppName(ameerName);

        if (normDoha === normAmeer) return 100;
        
        // simple subset check
        if (normDoha.includes(normAmeer) || normAmeer.includes(normDoha)) return 80;

        return 0; // for now, keep it simple
    }
}
