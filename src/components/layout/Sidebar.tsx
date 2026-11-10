/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Network,
  Award,
  Building2,
  HeartHandshake,
  BarChart3,
  Calendar,
  Lock,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  allowedRoles?: string[];
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, members, alerts, currentUserRole } = useChurch();

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const newConvertsCount = members.filter((m) => m.currentStatus === 'Novo Convertido').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'members',
      label: 'Cadastro de Pessoas',
      icon: Users,
      badge: members.length,
    },
    {
      id: 'wizard',
      label: 'Cadastro por Etapas',
      icon: UserPlus,
    },
    {
      id: 'member_record',
      label: 'Prontuário Individual',
      icon: FileText,
    },
    {
      id: 'family_tree',
      label: 'Árvore Familiar',
      icon: Network,
    },
    {
      id: 'ministerial',
      label: 'Histórico Ministerial',
      icon: Award,
    },
    {
      id: 'congregations',
      label: 'Congregações & Filiais',
      icon: Building2,
    },
    {
      id: 'pastoral',
      label: 'Acompanhamento Pastoral',
      icon: HeartHandshake,
      badge: newConvertsCount > 0 ? `${newConvertsCount}` : undefined,
    },
    {
      id: 'reports',
      label: 'Relatórios & Estatísticas',
      icon: BarChart3,
    },
    {
      id: 'birthdays',
      label: 'Agenda & Aniversários',
      icon: Calendar,
    },
    {
      id: 'lgpd',
      label: 'LGPD & Privacidade',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Configurações & Backup',
      icon: Settings,
      allowedRoles: ['ADMIN_GERAL'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.allowedRoles && !item.allowedRoles.includes(currentUserRole)) {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Institution header preview with logo */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <img
          src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
          alt="Ministério Palavra e Unção"
          className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0 border border-amber-500/40"
        />
        <div className="overflow-hidden">
          <div className="text-[10px] font-mono tracking-wider text-amber-400 font-semibold uppercase truncate">
            Gestão Eclesiástica
          </div>
          <div className="text-xs font-bold text-white truncate leading-tight">
            Ministério Palavra e Unção
          </div>
          <div className="text-[10px] text-amber-200/70 truncate">
            Transformando Vidas
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-700/90 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* LGPD Compliance & Operator info footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <span className="font-medium">Perfil Atual</span>
          <span className="font-mono text-amber-400 text-[10px] uppercase">
            {currentUserRole.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>LGPD Art. 11, II, c Ativo</span>
        </div>
      </div>
    </aside>
  );
};
