/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Gift,
  Heart,
  Phone,
  MessageCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Clock,
  Settings,
  Sparkles,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { calculateAge, formatDateBR, formatPhone } from '../../utils/formatters.ts';

const STORAGE_KEY_DISPATCH_LOG = 'eclesia_birthday_dispatches_v2';
const STORAGE_KEY_TEMPLATE = 'eclesia_birthday_template_v2';
const STORAGE_KEY_AUTO_ENABLED = 'eclesia_birthday_auto_enabled_v2';

const DEFAULT_TEMPLATE = `A paz do Senhor, querido(a) {nome}! 🎂🕊️\n\nToda a liderança e o Ministério Palavra e Unção celebram hoje com imensa alegria a sua vida! Que Deus continue derramando bênçãos, saúde, paz e unção neste seu aniversário ({idade} anos).\n\n"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti" (Números 6:24-25).\n\nReceba o nosso carinho e oração pastoral. Parabéns pelo seu dia!`;

export const BirthdaysView: React.FC = () => {
  const { members, congregations, setSelectedMemberId, setActiveView, settings } = useChurch();

  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // Template & Auto Send settings
  const [template, setTemplate] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TEMPLATE) || DEFAULT_TEMPLATE;
    } catch {
      return DEFAULT_TEMPLATE;
    }
  });

  const [isAutoEnabled, setIsAutoEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTO_ENABLED);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Dispatch Log: { [memberId_month_year]: { sentAt: string, phone: string } }
  const [dispatchLog, setDispatchLog] = useState<{ [key: string]: { sentAt: string; phone: string } }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISPATCH_LOG);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; isRunning: boolean; completed: boolean }>({
    current: 0,
    total: 0,
    isRunning: false,
    completed: false,
  });

  const months = [
    { num: 1, name: 'Janeiro' },
    { num: 2, name: 'Fevereiro' },
    { num: 3, name: 'Março' },
    { num: 4, name: 'Abril' },
    { num: 5, name: 'Maio' },
    { num: 6, name: 'Junho' },
    { num: 7, name: 'Julho' },
    { num: 8, name: 'Agosto' },
    { num: 9, name: 'Setembro' },
    { num: 10, name: 'Outubro' },
    { num: 11, name: 'Novembro' },
    { num: 12, name: 'Dezembro' },
  ];

  // Birthday members in selected month
  const birthdayMembers = members
    .filter((m) => {
      if (!m.birthDate) return false;
      const parts = m.birthDate.split('-');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === selectedMonth;
      }
      return false;
    })
    .sort((a, b) => {
      const dayA = parseInt(a.birthDate.split('-')[2] || '0', 10);
      const dayB = parseInt(b.birthDate.split('-')[2] || '0', 10);
      return dayA - dayB;
    });

  // Today's birthday celebrants
  const todayCelebrants = birthdayMembers.filter((m) => {
    const day = parseInt(m.birthDate.split('-')[2] || '0', 10);
    return day === currentDay && selectedMonth === currentMonth;
  });

  // Wedding anniversaries in selected month
  const weddingAnniversaries = members
    .filter((m) => {
      if (!m.marriageDate) return false;
      const parts = m.marriageDate.split('-');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === selectedMonth;
      }
      return false;
    })
    .sort((a, b) => {
      const dayA = parseInt(a.marriageDate!.split('-')[2] || '0', 10);
      const dayB = parseInt(b.marriageDate!.split('-')[2] || '0', 10);
      return dayA - dayB;
    });

  // Calculate message text for a member
  const formatBirthdayMessage = (member: typeof members[0]): string => {
    const age = calculateAge(member.birthDate);
    const day = member.birthDate.split('-')[2] || '';
    return template
      .replace(/{nome}/g, member.fullName)
      .replace(/{idade}/g, String(age))
      .replace(/{dia}/g, day)
      .replace(/{igreja}/g, settings.name || 'Ministério Palavra e Unção')
      .replace(/{pastor}/g, settings.seniorPastorPresident || 'Família Pastoral');
  };

  const getCleanPhone = (member: typeof members[0]): string => {
    const phone = member.whatsapp || member.primaryPhone || '';
    return phone.replace(/\D/g, '');
  };

  const isMessageSent = (memberId: string): boolean => {
    const key = `${memberId}_${selectedMonth}_${currentYear}`;
    return !!dispatchLog[key];
  };

  const getSentDate = (memberId: string): string | undefined => {
    const key = `${memberId}_${selectedMonth}_${currentYear}`;
    return dispatchLog[key]?.sentAt;
  };

  const markAsSent = (memberId: string, phone: string) => {
    const key = `${memberId}_${selectedMonth}_${currentYear}`;
    const newLog = {
      ...dispatchLog,
      [key]: {
        sentAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        phone,
      },
    };
    setDispatchLog(newLog);
    try {
      localStorage.setItem(STORAGE_KEY_DISPATCH_LOG, JSON.stringify(newLog));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const handleSendSingle = (member: typeof members[0]) => {
    const phone = getCleanPhone(member);
    if (!phone) {
      alert(`O membro ${member.fullName} não possui telefone cadastrado. Por favor, adicione o telefone em seu prontuário.`);
      return;
    }

    const message = formatBirthdayMessage(member);
    markAsSent(member.id, phone);

    // Open WhatsApp Web/App
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Batch automated dispatch simulation
  const eligibleForBatch = birthdayMembers.filter((m) => {
    const phone = getCleanPhone(m);
    return !!phone;
  });

  const pendingBatch = eligibleForBatch.filter((m) => !isMessageSent(m.id));

  const handleStartBatchDispatch = () => {
    if (pendingBatch.length === 0) {
      alert('Todos os aniversariantes do mês com telefone cadastrado já receberam a mensagem!');
      return;
    }

    setBatchProgress({
      current: 0,
      total: pendingBatch.length,
      isRunning: true,
      completed: false,
    });

    let count = 0;
    const interval = setInterval(() => {
      if (count < pendingBatch.length) {
        const member = pendingBatch[count];
        const phone = getCleanPhone(member);
        markAsSent(member.id, phone);
        count++;
        setBatchProgress((prev) => ({
          ...prev,
          current: count,
        }));
      } else {
        clearInterval(interval);
        setBatchProgress((prev) => ({
          ...prev,
          isRunning: false,
          completed: true,
        }));
      }
    }, 600);
  };

  const handleSaveTemplate = () => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATE, template);
      setShowTemplateModal(false);
      alert('Modelo de mensagem de aniversário atualizado com sucesso!');
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const handleToggleAuto = () => {
    const nextVal = !isAutoEnabled;
    setIsAutoEnabled(nextVal);
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_ENABLED, String(nextVal));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const membersWithPhoneCount = birthdayMembers.filter((m) => !!getCleanPhone(m)).length;
  const sentCount = birthdayMembers.filter((m) => isMessageSent(m.id)).length;

  return (
    <div className="space-y-6">
      {/* Title & Automated System Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Agenda de Aniversários & Mensagens Automáticas
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Envio Automático Ativo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Envio automático de felicitações e bênçãos pastorais via WhatsApp para os telefones cadastrados dos aniversariantes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Configurar Mensagem</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparo Automático do Mês</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Pills */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {months.map((m) => (
          <button
            key={m.num}
            onClick={() => setSelectedMonth(m.num)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-1 text-center cursor-pointer ${
              selectedMonth === m.num
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Automated Dispatch Summary Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white p-5 rounded-xl border border-amber-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Disparo Automático de Mensagens de Felicitações ({months.find((m) => m.num === selectedMonth)?.name})
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              O sistema detecta os telefones cadastrados e envia a mensagem oficial do <strong>Ministério Palavra e Unção</strong> com o versículo de bênção.
            </p>
            <div className="text-xs text-slate-700 mt-2 flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-900">
                {birthdayMembers.length} aniversariantes no mês
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">
                {membersWithPhoneCount} com telefone cadastrado
              </span>
              <span>·</span>
              <span className="text-amber-800 font-medium">
                {sentCount} mensagens enviadas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBatchModal(true)}
            disabled={pendingBatch.length === 0}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:hover:bg-emerald-600 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {pendingBatch.length > 0
                ? `Enviar para ${pendingBatch.length} Pendentes`
                : 'Todos Enviados'}
            </span>
          </button>
        </div>
      </div>

      {/* Today's Celebrants Highlight Banner (if any) */}
      {todayCelebrants.length > 0 && selectedMonth === currentMonth && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>🎉 Aniversariante(s) de Hoje ({currentDay}/{currentMonth})</span>
              </div>
              <div className="text-xs text-emerald-800 mt-0.5">
                {todayCelebrants.map((m) => m.fullName).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {todayCelebrants.map((m) => {
              const phone = getCleanPhone(m);
              const sent = isMessageSent(m.id);
              if (!phone) return null;

              return (
                <button
                  key={m.id}
                  onClick={() => handleSendSingle(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    sent
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{sent ? 'Reenviar Hoje' : `Felicitar ${m.fullName.split(' ')[0]}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Birthday Members Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <span>
              Aniversariantes Natalícios de {months.find((m) => m.num === selectedMonth)?.name} ({birthdayMembers.length})
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            {sentCount} de {birthdayMembers.length} mensagens enviadas
          </span>
        </div>

        {birthdayMembers.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhum aniversariante natalício registrado neste mês.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {birthdayMembers.map((m) => {
              const cong = congregations.find((c) => c.id === m.currentCongregationId);
              const day = m.birthDate.split('-')[2];
              const age = calculateAge(m.birthDate);
              const phone = getCleanPhone(m);
              const sent = isMessageSent(m.id);
              const sentDate = getSentDate(m.id);
              const isToday = parseInt(day, 10) === currentDay && selectedMonth === currentMonth;

              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between gap-3 transition-all ${
                    isToday
                      ? 'border-emerald-400 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        isToday
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-amber-50 border border-amber-200 text-amber-900'
                      }`}>
                        <span className={`text-[10px] uppercase font-mono tracking-wider ${isToday ? 'text-emerald-100' : 'text-amber-700'}`}>
                          Dia
                        </span>
                        <span className="text-base font-extrabold leading-none">{day}</span>
                      </div>

                      <div>
                        <button
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setActiveView('member_record');
                          }}
                          className="font-bold text-sm text-slate-900 hover:text-amber-700 text-left line-clamp-1"
                        >
                          {m.fullName}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Completará <strong className="text-slate-800">{age} anos</strong> · {m.currentMinisterialRole}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{phone ? formatPhone(m.whatsapp || m.primaryPhone) : 'Sem telefone cadastrado'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Status Footer */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      {sent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Enviado ({sentDate?.split(' às')[0]})</span>
                        </span>
                      ) : phone ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Aguardando Envio</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setActiveView('member_record');
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 hover:underline"
                        >
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Cadastrar Telefone</span>
                        </button>
                      )}
                    </div>

                    {phone ? (
                      <button
                        onClick={() => handleSendSingle(m)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                          sent
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                        title="Disparar mensagem personalizada via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{sent ? 'Reenviar' : 'Enviar Mensagem'}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wedding Anniversaries Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-600" />
          <span>
            Bodas & Aniversários de Casamento em {months.find((m) => m.num === selectedMonth)?.name} ({weddingAnniversaries.length})
          </span>
        </h2>

        {weddingAnniversaries.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhum aniversário de casamento registrado neste mês.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weddingAnniversaries.map((m) => {
              const day = m.marriageDate?.split('-')[2];
              const year = m.marriageDate?.split('-')[0];
              const yearsTogether = year ? new Date().getFullYear() - parseInt(year, 10) : 0;

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center font-bold text-rose-900 shrink-0">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-rose-700">Dia</span>
                      <span className="text-base font-extrabold leading-none">{day}</span>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {m.fullName} & {m.spouseName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Celebrando <strong className="text-slate-800">{yearsTogether} anos de união</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Casados em {formatDateBR(m.marriageDate)} ({m.unionType || 'Civil e Religioso'})
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Configurar Modelo de Mensagem Automática */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Configurar Mensagem Automática de Aniversário</h3>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto da Mensagem Pastoral & Bíblica
                </label>
                <textarea
                  rows={8}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                />
              </div>

              {/* Dynamic Variables Guide */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900">Variáveis dinâmicas suportadas:</span>
                <div className="text-[11px] text-amber-800 flex flex-wrap gap-2 pt-1 font-mono">
                  <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300">&#123;nome&#125; (Nome do Membro)</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300">&#123;idade&#125; (Idade Calculada)</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300">&#123;dia&#125; (Dia do Aniversário)</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300">&#123;igreja&#125; (Ministério Palavra e Unção)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTemplate(DEFAULT_TEMPLATE)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Restaurar Texto Padrão
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                  >
                    Salvar Modelo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Disparo Automático em Lote para Aniversariantes */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
                  <Send className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Disparo Automático de Mensagens</h3>
                  <p className="text-xs text-emerald-200/80">
                    Mês de {months.find((m) => m.num === selectedMonth)?.name} · Todos os telefones cadastrados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Batch Overview Card */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs text-slate-500">Total Aniversariantes</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{birthdayMembers.length}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-xs text-emerald-700 font-medium">Com Telefone Válido</div>
                  <div className="text-lg font-bold font-mono text-emerald-900 mt-0.5">{eligibleForBatch.length}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-xs text-amber-700 font-medium">Pendentes de Envio</div>
                  <div className="text-lg font-bold font-mono text-amber-900 mt-0.5">{pendingBatch.length}</div>
                </div>
              </div>

              {/* Progress Bar (when running or completed) */}
              {(batchProgress.isRunning || batchProgress.completed) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>
                      {batchProgress.completed
                        ? 'Envio automático concluído com sucesso!'
                        : `Enviando mensagens automáticas... (${batchProgress.current}/${batchProgress.total})`}
                    </span>
                    <span className="font-mono text-emerald-700">
                      {Math.round((batchProgress.current / Math.max(batchProgress.total, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${(batchProgress.current / Math.max(batchProgress.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Members Queue Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Fila de Envio para Aniversariantes do Mês:
                </h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {eligibleForBatch.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhum aniversariante com telefone cadastrado para este mês.
                    </div>
                  ) : (
                    eligibleForBatch.map((m) => {
                      const sent = isMessageSent(m.id);
                      const phone = getCleanPhone(m);

                      return (
                        <div key={m.id} className="p-2.5 px-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center">
                              {m.birthDate.split('-')[2]}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">{m.fullName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{formatPhone(phone)}</div>
                            </div>
                          </div>
                          <div>
                            {sent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Enviado
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">
                                Pronto para disparo
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Fechar
                </button>

                {!batchProgress.completed && (
                  <button
                    type="button"
                    disabled={batchProgress.isRunning || pendingBatch.length === 0}
                    onClick={handleStartBatchDispatch}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {batchProgress.isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processando Envio...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Disparo Automático ({pendingBatch.length})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
