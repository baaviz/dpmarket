import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedApps() {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'doha-apps-snapshot.json');
    if (!fs.existsSync(dataPath)) {
        console.error('Snapshot not found. Run apps:build-snapshot first.');
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const apps = JSON.parse(rawData);

    console.log(`Loaded ${apps.length} apps from snapshot. Beginning seed...`);

    const batchSize = 500;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < apps.length; i += batchSize) {
        const batch = apps.slice(i, i + batchSize).map((a: any) => ({
            name: a.name,
            slug: a.slug,
            description: a.description,
            category: a.category,
            source_icon_url: a.icon_url, // Save original image here
            icon_url: a.icon_url, // For fallback
            source_provider: 'doha-plus',
            synced_from: 'snapshot',
            last_synced_at: new Date().toISOString(),
            is_active: true
        }));

        const { error } = await supabase
            .from('apps_catalog')
            .upsert(batch, { onConflict: 'slug' });

        if (error) {
            console.error(`Error in batch ${i} to ${i + batchSize}:`, error.message);
            failCount += batch.length;
        } else {
            successCount += batch.length;
            console.log(`Seeded ${successCount}/${apps.length}...`);
        }
    }

    console.log(`Seed complete. Successfully inserted/updated ${successCount} apps. Failed: ${failCount}.`);
}

seedApps().catch(console.error);
