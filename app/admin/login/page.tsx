'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    if (success) {
      router.push('/admin');
    } else {
      setError('Usuario ou senha incorretos');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D4AD4E] to-[#A6832E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#C8A24D]/10">
            <span className="text-lg font-bold text-black tracking-tight">L7</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Painel Admin</h1>
          <p className="text-[13px] text-[#555]">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-[#555] uppercase tracking-widest mb-2 font-medium">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu usuario"
              required
              autoComplete="username"
              className="w-full px-4 py-3 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#555] uppercase tracking-widest mb-2 font-medium">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 bg-[#0e0e0e] border border-[#181818] rounded-xl text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#C8A24D]/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-[#ff5555]/[0.06] border border-[#ff5555]/[0.1] rounded-xl text-[13px] text-[#ff5555]/80">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#D4AD4E] to-[#A6832E] text-black text-[13px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#C8A24D]/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
