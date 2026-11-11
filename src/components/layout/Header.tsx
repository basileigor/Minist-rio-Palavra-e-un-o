/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Search,
  UserPlus,
  Shield,
  X,
  AlertTriangle,
  Calendar,
  UserCheck,
  FileCheck,
  KeyRound,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

export const Header: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    setActiveView,
    setSelectedMemberId,
    members,
    adminUser,
    currentUser,
    setShowAdminCredentialsModal,
    logout,
  } = useChurch();

  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAlerts = alerts.filter((a) => !a.resolved);

  const filteredSearchResults = searchQuery.trim()
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.cpf && m.cpf.includes(searchQuery.replace(/\D/g, ''))) ||
          m.currentMinisterialRole.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (memberId: string) => {
    setSelectedMemberId(memberId);
    setActiveView('member_record');
    setShowSearchModal(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title with Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
            alt="Logotipo Ministério Palavra e Unção"
            className="w-10 h-10 rounded-lg object-cover border border-amber-300 shadow-xs shrink-0"
          />
          <div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Ministério Palavra e Unção
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-amber-700 ml-1.5 pl-1.5 border-l border-slate-300 whitespace-nowrap">
              Transformando Vidas
            </span>
          </div>
        </div>



        {/* Zone 2: Operador - Usuário Autenticado com Menu de Perfil */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 rounded-lg text-amber-900 shadow-2xs transition-colors cursor-pointer group"
            title="Gerenciar conta, senha ou desconectar"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {currentUser?.name || 'Admin Geral'}
            </span>
            <span className="hidden md:inline-block text-[10px] font-normal text-amber-700/80 ml-0.5 pl-1.5 border-l border-amber-200 font-mono">
              @{currentUser?.username || adminUser.username}
            </span>
            <ChevronDown className="w-3 h-3 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* User Popover Menu */}
          {showAdminMenu && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-gradient-to-r from-slate-900 to-amber-950 text-white">
                <div className="text-[10px] font-mono text-amber-300 font-semibold uppercase tracking-wider">
                  {currentUser?.role === 'ADMIN_GERAL' ? 'Administrador Geral' : 'Usuário Autenticado'}
                </div>
                <div className="text-sm font-bold mt-0.5 truncate">{currentUser?.name || adminUser.name}</div>
                <div className="text-xs text-slate-300 font-mono mt-0.5 truncate">
                  login: <strong className="text-amber-200">@{currentUser?.username || adminUser.username}</strong>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {(!currentUser || currentUser.role === 'ADMIN_GERAL') && (
                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      setShowAdminCredentialsModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-semibold">Alterar Senha do Admin Geral</div>
                      <div className="text-[10px] text-slate-500">Configuração mestre do sistema</div>
                    </div>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setShowAdminMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-semibold">Bloquear / Sair do Sistema</div>
                    <div className="text-[10px] text-slate-400">Exige login de Admin para reentrar</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Actions & Notifications */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Buscar membro por nome, CPF ou matrícula"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Pesquisar...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">
              /
            </kbd>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsPopover(!showAlertsPopover)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notificações e Alertas Administrativos"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Alerts Dropdown */}
            {showAlertsPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      Alertas Administrativos
                    </span>
                    <span className="text-[11px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {activeAlerts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAlertsPopover(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {activeAlerts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Nenhum alerta pendente no momento.
                    </div>
                  ) : (
                    activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          {alert.type === 'aniversario' && (
                            <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'novo_convertido' && (
                            <UserPlus className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'integracao' && (
                            <UserCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'validade_doc' && (
                            <FileCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'atualizacao' && (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              {alert.title}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {alert.description}
                            </div>
                            {alert.memberId && (
                              <button
                                onClick={() => {
                                  setSelectedMemberId(alert.memberId!);
                                  setActiveView('member_record');
                                  setShowAlertsPopover(false);
                                }}
                                className="text-[11px] font-medium text-amber-700 hover:underline mt-1 block"
                              >
                                Abrir ficha do membro &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-slate-400 hover:text-slate-600 text-xs shrink-0 p-1"
                          title="Dispensar alerta"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Novo Membro Button */}
          <button
            onClick={() => {
              setSelectedMemberId(null);
              setActiveView('wizard');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Membro</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome, matrícula, CPF ou cargo..."
                className="w-full text-sm outline-hidden text-slate-800 placeholder-slate-400"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Comece a digitar para pesquisar em toda a base de membros da instituição.
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum registro encontrado para "{searchQuery}".
                </div>
              ) : (
                filteredSearchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectSearchResult(m.id)}
                    className="w-full text-left p-3 hover:bg-amber-50/60 rounded-lg flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 overflow-hidden">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          m.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 leading-tight">
                          {m.fullName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{m.registrationNumber}</span>
                          <span>·</span>
                          <span>{m.currentMinisterialRole}</span>
                          <span>·</span>
                          <span>{m.currentStatus}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-amber-700 font-medium whitespace-nowrap">
                      Abrir prontuário &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
