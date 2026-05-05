'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Link as LinkIcon, DownloadCloud, Database, AlertCircle } from 'lucide-react';

export default function EnrichmentPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const handleSyncDoha = async () => {
        setIsLoading(true);
        addLog('Starting Doha Plus App Sync...');
        try {
            const res = await fetch('/api/admin/apps/sync', { method: 'POST', body: JSON.stringify({ batchSize: 8500 }) });
            const data = await res.json();
            if (data.success) {
                addLog(`Doha Sync Complete. Parsed: ${data.stats.totalParsed}, Updated: ${data.stats.updated}`);
            } else {
                addLog(`Error: ${data.error}`);
            }
        } catch (e: unknown) {
            addLog(`Failed: ${(e as Error).message}`);
        }
        setIsLoading(false);
    };

    const handleSyncAmeer = async () => {
        setIsLoading(true);
        addLog('Starting Ameer Catalog Sync (Demo Sample)...');
        try {
            const sampleUrls = [
                'https://ipa.ameer.app/app/3355',
                'https://ipa.ameer.app/app/9363',
                'https://ipa.ameer.app/app/6541'
            ];
            const res = await fetch('/api/admin/apps/ameer-sync', { 
                method: 'POST', 
                body: JSON.stringify({ urls: sampleUrls }) 
            });
            const data = await res.json();
            if (data.success) {
                addLog(`Ameer Sync Complete. Processed: ${data.stats.processed}, New: ${data.stats.newApps}, Failed: ${data.stats.failed}`);
            } else {
                addLog(`Error: ${data.error}`);
            }
        } catch (e: unknown) {
            addLog(`Failed: ${(e as Error).message}`);
        }
        setIsLoading(false);
    };

    const handleMatch = async () => {
        setIsLoading(true);
        addLog('Starting Matching Engine (Threshold 90%)...');
        try {
            const res = await fetch('/api/admin/apps/ameer-match', { 
                method: 'POST', 
                body: JSON.stringify({ threshold: 90 }) 
            });
            const data = await res.json();
            if (data.success) {
                addLog(`Match Complete. Exact: ${data.stats.exactMatches}, Partial: ${data.stats.partialMatches}, Enriched: ${data.stats.enriched}`);
            } else {
                addLog(`Error: ${data.error}`);
            }
        } catch (e: unknown) {
            addLog(`Failed: ${(e as Error).message}`);
        }
        setIsLoading(false);
    };

    const handleMirror = async () => {
        setIsLoading(true);
        addLog('Starting Supabase Icon Mirroring...');
        try {
            const res = await fetch('/api/admin/apps/ameer-mirror', { 
                method: 'POST', 
                body: JSON.stringify({ batchSize: 50 }) 
            });
            const data = await res.json();
            if (data.success) {
                addLog(`Mirroring Complete. Processed: ${data.stats.processed}, Mirrored: ${data.stats.mirrored}, Failed: ${data.stats.failed}`);
            } else {
                addLog(`Error: ${data.error}`);
            }
        } catch (e: unknown) {
            addLog(`Failed: ${(e as Error).message}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-surface-900">App Enrichment Engine</h2>
                <p className="text-surface-500">Sync from Doha Plus, enrich from Ameer, and mirror icons to Supabase.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-primary-600">
                        <Database className="w-6 h-6" />
                        <h3 className="font-bold">1. Doha Plus Sync</h3>
                    </div>
                    <p className="text-sm text-surface-500 mb-6">Fetch the master catalog of apps from Doha Plus.</p>
                    <Button onClick={handleSyncDoha} disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Sync Doha Plus
                    </Button>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <DownloadCloud className="w-6 h-6" />
                        <h3 className="font-bold">2. Ameer Sync</h3>
                    </div>
                    <p className="text-sm text-surface-500 mb-6">Crawl and fetch enriched data and icons from IPA Ameer.</p>
                    <Button onClick={handleSyncAmeer} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Sync Ameer
                    </Button>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-purple-600">
                        <LinkIcon className="w-6 h-6" />
                        <h3 className="font-bold">3. Match Apps</h3>
                    </div>
                    <p className="text-sm text-surface-500 mb-6">Fuzzy match Ameer data to Doha apps and apply enrichment.</p>
                    <Button onClick={handleMatch} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Run Matching
                    </Button>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-surface-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-green-600">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="font-bold">4. Mirror Icons</h3>
                    </div>
                    <p className="text-sm text-surface-500 mb-6">Download remote icons and save them to Supabase Storage.</p>
                    <Button onClick={handleMirror} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Mirror to Supabase
                    </Button>
                </div>
            </div>

            <div className="bg-surface-900 rounded-2xl p-6 shadow-sm overflow-hidden h-[400px] flex flex-col">
                <h3 className="text-white font-bold mb-4 font-mono">Sync Logs</h3>
                <div className="flex-1 overflow-y-auto font-mono text-sm space-y-2">
                    {logs.map((log, i) => (
                        <div key={i} className="text-green-400 border-b border-surface-800 pb-2">
                            <span className="text-surface-500 mr-2">&gt;</span>{log}
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-surface-600 italic">Waiting for operations...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
