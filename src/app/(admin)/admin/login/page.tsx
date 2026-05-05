'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      window.location.href = '/admin/dashboard';
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 start-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 end-1/4 h-64 w-64 rounded-full bg-primary-400/8 blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-500/30 mb-4">
            <ShoppingBag className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Doha Plus</h1>
          <p className="text-sm text-surface-400 mt-1">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">تسجيل الدخول</h2>
            <p className="text-sm text-surface-400 mt-1">أدخل بيانات حساب المشرف</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dohaplus.com"
                required
                className="bg-surface-800/50 border-white/10 text-white placeholder:text-surface-500 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-surface-800/50 border-white/10 text-white placeholder:text-surface-500 focus-visible:ring-primary-500 pe-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              <LogIn className="h-4 w-4" />
              تسجيل الدخول
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-600 mt-6">
          © {new Date().getFullYear()} Doha Plus. Authorized access only.
        </p>
      </div>
    </div>
  );
}
