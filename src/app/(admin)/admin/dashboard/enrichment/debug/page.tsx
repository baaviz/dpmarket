import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DebugAppsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    // Admin check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('is_active')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_active) redirect('/admin/login');

    // Fetch Stats
    const { count: totalApps } = await supabase.from('apps_catalog').select('*', { count: 'exact', head: true });
    const { count: activeApps } = await supabase.from('apps_catalog').select('*', { count: 'exact', head: true }).eq('is_active', true);
    const { count: appsWithIcons } = await supabase.from('apps_catalog').select('*', { count: 'exact', head: true }).not('icon_url', 'is', null);
    const { count: appsWithMirroredIcons } = await supabase.from('apps_catalog').select('*', { count: 'exact', head: true }).not('icon_storage_path', 'is', null);
    const { count: enrichedApps } = await supabase.from('apps_catalog').select('*', { count: 'exact', head: true }).not('features', 'is', null);

    // Fetch sample apps
    const { data: sampleApps } = await supabase
        .from('apps_catalog')
        .select('id, name, slug, source_provider, icon_url, icon_storage_path, is_active')
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-surface-900">Database Debug: Apps Catalog</h2>
                <p className="text-surface-500">Real-time statistics directly from Supabase tables.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200">
                    <div className="text-sm text-surface-500">Total Rows</div>
                    <div className="text-2xl font-bold">{totalApps || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200">
                    <div className="text-sm text-surface-500">is_active = true</div>
                    <div className="text-2xl font-bold text-success">{activeApps || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200">
                    <div className="text-sm text-surface-500">Has icon_url</div>
                    <div className="text-2xl font-bold text-blue-600">{appsWithIcons || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200">
                    <div className="text-sm text-surface-500">Has icon_storage_path</div>
                    <div className="text-2xl font-bold text-purple-600">{appsWithMirroredIcons || 0}</div>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-surface-200">
                    <div className="text-sm text-surface-500">Enriched (Features)</div>
                    <div className="text-2xl font-bold text-amber-600">{enrichedApps || 0}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-50 text-surface-500 border-b border-surface-200">
                        <tr>
                            <th className="px-4 py-3">Icon</th>
                            <th className="px-4 py-3">Name / Slug</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {sampleApps?.map(app => (
                            <tr key={app.id} className="hover:bg-surface-50">
                                <td className="px-4 py-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface-100 overflow-hidden flex items-center justify-center text-xs text-surface-400">
                                        {app.icon_storage_path ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={app.icon_storage_path} alt="" className="w-full h-full object-cover" />
                                        ) : app.icon_url ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={app.icon_url} alt="" className="w-full h-full object-cover" />
                                        ) : 'No Icon'}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-surface-900">{app.name}</div>
                                    <div className="text-xs text-surface-500">{app.slug}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex px-2 py-1 rounded bg-surface-100 text-xs text-surface-700 font-mono">
                                        {app.source_provider || 'doha-plus'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {app.is_active ? (
                                        <span className="text-success font-bold text-xs">Active</span>
                                    ) : (
                                        <span className="text-surface-400 font-bold text-xs">Inactive</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(!sampleApps || sampleApps.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-surface-500">
                                    No apps found in the database. Please run Sync.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
