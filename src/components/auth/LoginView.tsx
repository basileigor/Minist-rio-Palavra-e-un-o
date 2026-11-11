/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Church,
  Globe,
  Copy,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

export const LoginView: React.FC = () => {
  const { login, loginAsEndUser, adminUser, officialPresentationUrl } = useChurch();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentDisplayUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : officialPresentationUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialPresentationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

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
        {/* Banner do Link Oficial para o Usuário Final */}
        <div className="mb-4 bg-emerald-950/85 backdrop-blur-md border border-emerald-400/40 rounded-2xl p-4 text-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-emerald-200 flex items-center gap-1.5 flex-wrap">
                  <span>Link Oficial Disponível para o Usuário Final</span>
                  <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    membrospalavraeuncao
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                  {officialPresentationUrl}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800/60">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Copiar link oficial"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  'Acesse o Sistema de Gestão de Membros do Ministério Palavra e Unção através do link oficial: ' + officialPresentationUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded-lg text-xs font-semibold transition-colors"
                title="Compartilhar no WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

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
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] text-slate-400 font-medium">Link Oficial:</span>
              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                membrospalavraeuncao
              </span>
            </div>
          </div>

          {/* Card do Usuário Final / Apresentação */}
          <div className="p-6 bg-gradient-to-b from-emerald-50/70 via-emerald-50/30 to-white border-b border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-emerald-950">
                  Acesso Direto ao Usuário Final
                </h2>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Sem Senha
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Disponível para todos os membros, visitantes e liderança consultarem a apresentação oficial do <strong>Ministério Palavra e Unção</strong>.
            </p>

            <button
              type="button"
              onClick={loginAsEndUser}
              className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:from-emerald-700 active:to-teal-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Globe className="w-4 h-4 text-emerald-200 group-hover:rotate-45 transition-transform" />
              <span>Acessar Apresentação Oficial (Usuário Final) &rarr;</span>
            </button>
          </div>

          <div className="px-8 pt-4 pb-1 text-center">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                ou acesso restrito de Administrador
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
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
