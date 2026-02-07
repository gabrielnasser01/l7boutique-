'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User as UserIcon, Eye, EyeOff, Phone, CreditCard } from 'lucide-react';
import { useUserAuth } from '@/contexts/user-auth-context';
import { AccountDashboard } from '@/components/account/account-dashboard';

export default function AccountPage() {
  const { user, loading, signIn, signUp } = useUserAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <AccountDashboard />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (isLogin) {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      if (!fullName.trim()) {
        setError('Informe seu nome completo.');
        setSubmitting(false);
        return;
      }
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('Informe um celular valido.');
        setSubmitting(false);
        return;
      }
      const cpfDigits = cpf.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        setError('Informe um CPF valido.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setSubmitting(false);
        return;
      }
      const result = await signUp(email, password, fullName.trim(), phone.trim(), cpf.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Conta criada com sucesso! Voce ja esta logado.');
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-wide-boutique font-sans text-gold mb-3 uppercase">
            {isLogin ? 'Bem-vindo de Volta' : 'Criar Conta'}
          </p>
          <h1 className="text-3xl font-serif text-charcoal font-light">
            {isLogin ? 'Entrar' : 'Registrar'}
          </h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-[12px] font-sans text-center"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 border border-green-200 bg-green-50 text-green-700 text-[12px] font-sans text-center"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2">
                  Celular
                </label>
                <div className="relative">
                  <Phone size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = digits;
                      if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                      if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                      setPhone(formatted);
                    }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2">
                  CPF
                </label>
                <div className="relative">
                  <CreditCard size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = digits;
                      if (digits.length > 3) formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
                      if (digits.length > 6) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
                      if (digits.length > 9) formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
                      setCpf(formatted);
                    }}
                    className="w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-boutique font-sans text-charcoal/50 uppercase mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-11 bg-transparent border border-charcoal/15 text-[13px] font-sans text-charcoal placeholder:text-charcoal/25 outline-none focus:border-gold transition-colors"
                placeholder={isLogin ? 'Sua senha' : 'Minimo 6 caracteres'}
                required
                minLength={isLogin ? undefined : 6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 flex items-center justify-center gap-2 bg-charcoal text-ivory border border-charcoal text-[11px] tracking-boutique font-sans uppercase hover:bg-transparent hover:text-charcoal active:scale-[0.98] transition-all duration-400 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <div className="w-4 h-4 border border-ivory/30 border-t-ivory rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                <ArrowRight size={14} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-[12px] font-sans text-charcoal/50 hover:text-charcoal transition-colors"
          >
            {isLogin ? 'Nao tem conta? Registre-se' : 'Ja tem conta? Entre'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
