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
  UserPlus,
  Phone,
  Mail,
  LogIn,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

export const LoginView: React.FC = () => {
  const { login, registerUser, adminUser } = useChurch();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status and feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor, informe seu login (ou e-mail) e a senha de acesso.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(usernameOrEmail, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Credenciais inválidas. Verifique seu login e senha.');
      }
      setLoading(false);
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim() || !regUsername.trim() || !regPassword) {
      setErrorMessage('Por favor, preencha o Nome Completo, Login de Usuário e a Senha.');
      return;
    }

    if (regUsername.trim().length < 3) {
      setErrorMessage('O nome de login deve possuir pelo menos 3 caracteres.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('A confirmação da senha não confere com a senha digitada.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = registerUser({
        name: regFullName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim() || undefined,
        password: regPassword,
        role: 'MEMBRO',
      });

      if (!result.success) {
        setErrorMessage(result.message);
        setLoading(false);
      } else {
        setSuccessMessage(result.message);
        // User is automatically logged in and authenticated by registerUser
      }
    }, 400);
  };

  const handleFillDemoAdmin = () => {
    setUsernameOrEmail(adminUser.username || 'admin');
    setPassword(adminUser.password || 'admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-200/40 overflow-hidden">
          {/* Header with Church Logo & Identity */}
          <div className="bg-gradient-to-b from-amber-50 to-white px-8 pt-7 pb-5 text-center border-b border-slate-100">
            <div className="inline-block relative mb-3">
              <img
                src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
                alt="Ministério Palavra e Unção"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mx-auto shadow-md border-2 border-amber-400"
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
          </div>

          {/* Dual Tabs: Entrar vs Cadastrar Acesso */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-600" />
              <span>Já Tenho Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário</span>
            </button>
          </div>

          {/* Alerts / Error feedback */}
          {errorMessage && (
            <div className="mx-6 mt-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-semibold">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4">
              <div className="pb-1">
                <h2 className="text-sm font-bold text-slate-900">
                  Acessar com Login e Senha
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe suas credenciais registradas (usuário final ou administrador).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Seu usuário ou e-mail cadastrado"
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
                    onClick={handleFillDemoAdmin}
                    className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline font-medium"
                    title="Preencher com credenciais padrão de Admin Geral"
                  >
                    Usar login de Admin Geral
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha cadastrada"
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
                    <LogIn className="w-4 h-4" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Não tem login ainda? Cadastre sua senha de usuário final aqui &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4">
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Cadastrar Login e Senha para Ter Acesso
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Crie suas credenciais para acessar a página do sistema, independente do admin.
                </p>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Usuário de Login */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escolha seu Usuário de Login *
                </label>
                <div className="relative">
                  <span className="text-xs font-mono font-bold text-slate-400 absolute left-3 top-2.5 pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ex: joaosilva"
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Será usado para entrar no sistema (letras e números, sem espaços).
                </p>
              </div>

              {/* WhatsApp e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="(21) 98765-4321"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail (opcional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Criar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Concluir Cadastro e Ter Acesso à Página</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Já é cadastrado? Clique aqui para fazer login &rarr;
                </button>
              </div>
            </form>
          )}

          {/* Helper Banner de Apoio */}
          <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
            <span>Acesso obrigatório via Login e Senha</span>
            <span>Ministério Palavra e Unção</span>
          </div>
        </div>

        {/* Security / Legal disclaimer */}
        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>Sistema Integral de Gestão de Membros · LGPD em conformidade</span>
        </div>
      </div>
    </div>
  );
};
