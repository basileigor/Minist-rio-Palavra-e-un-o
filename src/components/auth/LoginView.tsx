/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, Church } from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

export const LoginView: React.FC = () => {
  const { login, adminUser } = useChurch();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor, preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(usernameOrEmail, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Credenciais inválidas.');
      }
      setLoading(false);
    }, 350);
  };

  const handleFillDemo = () => {
    setUsernameOrEmail(adminUser.username || 'admin');
    setPassword(adminUser.password || 'admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-center p-4 sm:p-6">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-200/40 overflow-hidden">
          {/* Header with Church Logo & Identity */}
          <div className="bg-gradient-to-b from-amber-50 to-white px-8 pt-8 pb-6 text-center border-b border-slate-100">
            <div className="inline-block relative mb-3">
              <img
                src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
                alt="Ministério Palavra e Unção"
                className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-md border-2 border-amber-400"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Ministério Palavra e Unção
            </h1>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mt-0.5">
              Transformando Vidas
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Acesso Restrito: Administrador Geral</span>
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] text-slate-400 font-medium">Link Oficial:</span>
              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                membrospalavraeuncao
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Usuário ou E-mail do Admin Geral
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Ex: admin ou admin@palavraeuncao.com.br"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline font-medium"
                  title="Preencher login padrão do sistema"
                >
                  Usar login padrão
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de Admin"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Banner */}
          <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Login padrão: <strong className="text-slate-700 font-mono">admin</strong></span>
            <span>Senha padrão: <strong className="text-slate-700 font-mono">admin123</strong></span>
          </div>
        </div>

        {/* Security / Legal disclaimer */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>Sistema de Gestão Eclesiástica Integral · LGPD em conformidade</span>
        </div>
      </div>
    </div>
  );
};
