'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  Archive,
  ShoppingCart,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  AppWindow,
  FileText,
  RefreshCw,
  Users,
  Grid,
  ChevronRight,
} from 'lucide-react';

interface AdminSession {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

const navItems = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/admin/dashboard/categories', label: 'التصنيفات', icon: Grid },
  { href: '/admin/dashboard/inventory', label: 'المخزون', icon: Archive },
  { href: '/admin/dashboard/orders', label: 'الطلبات', icon: ShoppingCart },
  { href: '/admin/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/admin/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/admin/dashboard/apps', label: 'التطبيقات', icon: AppWindow },
  { href: '/admin/dashboard/enrichment', label: 'محرك البيانات', icon: RefreshCw },
  { href: '/admin/dashboard/pages', label: 'الصفحات', icon: FileText },
  { href: '/admin/dashboard/settings', label: 'الإعدادات', icon: Settings },
  { href: '/admin/dashboard/audit', label: 'سجل النشاط', icon: ScrollText },
];

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const roleLabels: Record<string, string> = {
    owner: 'مالك',
    admin: 'مشرف',
    support: 'دعم',
    analyst: 'محلل',
  };

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden" dir="rtl">
      {/* Sidebar Overlay (Mobile) */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-surface-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 w-72 bg-surface-950 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-500/20">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white tracking-tight">دوحة بلس</span>
            <span className="text-[10px] uppercase tracking-widest text-primary-500 font-bold">Admin Portal</span>
          </div>
          <button
            className="lg:hidden ms-auto h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-surface-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-surface-400 hover:text-white hover:bg-white/5',
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-white" : "group-hover:text-primary-400")} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronLeft className="h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-white/2">
          <div className="bg-white/5 rounded-2xl p-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold shadow-inner">
                  {session.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{session.fullName}</p>
                  <p className="text-[10px] text-surface-500 font-medium uppercase tracking-tighter">{roleLabels[session.role] || session.role}</p>
                </div>
              </div>
          </div>
          <Link
            href="/api/admin/logout"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Overlay */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-surface-100 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-surface-50 border border-surface-100 text-surface-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all lg:hidden shadow-sm"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-surface-900 truncate">
                    {navItems.find(item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)))?.label || 'لوحة التحكم'}
                </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-2"
              target="_blank"
            >
              <ChevronRight className="h-4 w-4" />
              عرض المتجر
            </Link>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
