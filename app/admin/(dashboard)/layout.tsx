'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/admin-auth-context';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Image as ImageIcon,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Loader2,
  Bell,
  Tag,
  Grid3X3,
  FolderOpen,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Painel', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/marcas', label: 'Marcas', icon: Tag },
  { href: '/admin/categorias', label: 'Categorias', icon: Grid3X3 },
  { href: '/admin/colecoes', label: 'Colecoes', icon: FolderOpen },
  { href: '/admin/imagens', label: 'Imagens', icon: ImageIcon },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" />
      </div>
    );
  }

  if (!admin) {
    router.push('/admin/login');
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C8A24D]" />
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#111] border border-[#1c1c1c] rounded-xl shadow-lg shadow-black/30"
      >
        <Menu className="w-5 h-5 text-[#999]" />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#0c0c0c] border-r border-[#161616] flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#D4AD4E] to-[#A6832E] rounded-xl flex items-center justify-center shadow-md shadow-[#C8A24D]/10">
              <span className="text-[11px] font-bold text-black tracking-tight">L7</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white tracking-wide">L7 Boutique</span>
              <span className="text-[10px] text-[#555] tracking-wider uppercase">Admin</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-[#555] hover:text-white rounded-lg hover:bg-[#161616] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 pt-2 pb-3">
          <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest px-3">Menu</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C8A24D]/8 text-[#D4AD4E]'
                    : 'text-[#666] hover:text-[#aaa] hover:bg-[#111]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#C8A24D]/10' : ''}`}>
                  <Icon className="w-[16px] h-[16px]" />
                </div>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8A24D]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#141414] space-y-0.5">
          <div className="px-3 py-2.5 mb-1 bg-[#111] rounded-xl">
            <p className="text-[10px] text-[#555] uppercase tracking-wider">Logado como</p>
            <p className="text-[13px] text-white font-medium mt-0.5">{admin.name || admin.username}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#555] hover:text-[#aaa] rounded-xl hover:bg-[#111] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para loja
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#ff5555]/60 hover:text-[#ff5555] rounded-xl hover:bg-[#ff5555]/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <div className="sticky top-0 z-30 bg-[#080808]/80 backdrop-blur-xl border-b border-[#121212]">
          <div className="max-w-7xl mx-auto flex items-center justify-end h-14 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-[#555] hover:text-white rounded-xl hover:bg-[#111] transition-colors">
                <Bell className="w-[18px] h-[18px]" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AD4E] to-[#A6832E] flex items-center justify-center">
                <span className="text-[10px] font-bold text-black">{(admin.name || admin.username || 'A').charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
