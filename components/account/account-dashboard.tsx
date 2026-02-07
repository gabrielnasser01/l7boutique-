'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Package, LogOut, ChevronRight } from 'lucide-react';
import { useUserAuth } from '@/contexts/user-auth-context';
import { ProfileTab } from './profile-tab';
import { AddressesTab } from './addresses-tab';
import { OrdersTab } from './orders-tab';

type Tab = 'profile' | 'addresses' | 'orders';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Meus Dados', icon: User },
  { id: 'addresses', label: 'Enderecos', icon: MapPin },
  { id: 'orders', label: 'Meus Pedidos', icon: Package },
];

export function AccountDashboard() {
  const { user, profile, signOut } = useUserAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">
            Minha Conta
          </p>
          <h1 className="text-3xl font-serif text-charcoal font-light">
            Ola, {displayName}
          </h1>
          <p className="text-[12px] font-sans text-charcoal/40 mt-2">{user?.email}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <nav className="lg:w-56 shrink-0">
            <div className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[12px] font-sans tracking-wide transition-all duration-200 border ${
                      isActive
                        ? 'border-charcoal/15 bg-charcoal/[0.03] text-charcoal'
                        : 'border-transparent text-charcoal/40 hover:text-charcoal/70 hover:bg-charcoal/[0.02]'
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                    <span className="uppercase tracking-boutique">{tab.label}</span>
                    <ChevronRight size={14} strokeWidth={1.5} className="ml-auto opacity-30" />
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-charcoal/8">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[12px] font-sans tracking-boutique uppercase text-charcoal/30 hover:text-red-500 transition-colors duration-200"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sair
              </button>
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'orders' && <OrdersTab />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
