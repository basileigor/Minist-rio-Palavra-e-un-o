/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit,
  Shield,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { Congregation } from '../../types/church.ts';

export const CongregationsView: React.FC = () => {
  const { congregations, addCongregation, updateCongregation, members, setActiveView, setActiveCongregationId } = useChurch();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isHeadquarters, setIsHeadquarters] = useState(false);
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Nova Iguaçu');
  const [state, setState] = useState('RJ');
  const [seniorPastor, setSeniorPastor] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [foundationDate, setFoundationDate] = useState('2024-01-01');
  const [capacity, setCapacity] = useState(300);

  const handleOpenNew = () => {
    setEditingId(null);
    setCode(`FIL-${String(congregations.length + 1).padStart(2, '0')}`);
    setName('');
    setIsHeadquarters(false);
    setAddress('');
    setNeighborhood('');
    setCity('Nova Iguaçu');
    setState('RJ');
    setSeniorPastor('');
    setPhone('');
    setEmail('');
    setFoundationDate(new Date().toISOString().split('T')[0]);
    setCapacity(300);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Congregation) => {
    setEditingId(c.id);
    setCode(c.code);
    setName(c.name);
    setIsHeadquarters(c.isHeadquarters);
    setAddress(c.address);
    setNeighborhood(c.neighborhood);
    setCity(c.city);
    setState(c.state);
    setSeniorPastor(c.seniorPastor);
    setPhone(c.phone);
    setEmail(c.email);
    setFoundationDate(c.foundationDate);
    setCapacity(c.capacity);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateCongregation(editingId, {
        code,
        name,
        isHeadquarters,
        address,
        neighborhood,
        city,
        state,
        seniorPastor,
        phone,
        email,
        foundationDate,
        capacity: Number(capacity),
      });
    } else {
      addCongregation({
        code,
        name,
        isHeadquarters,
        address,
        neighborhood,
        city,
        state,
        seniorPastor,
        phone,
        email,
        foundationDate,
        capacity: Number(capacity),
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Gestão de Congregações & Filiais
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administração da sede central, congregações filiais e pontos de pregação do ministério.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Filial / Congregação</span>
        </button>
      </div>

      {/* Grid of Congregations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {congregations.map((c) => {
          const congregationMembers = members.filter((m) => m.currentCongregationId === c.id);
          const activeMembersCount = congregationMembers.filter((m) => m.currentStatus === 'Membro Ativo').length;
          const workersCount = congregationMembers.filter((m) => m.currentMinisterialRole !== 'Membro').length;

          return (
            <div
              key={c.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                c.isHeadquarters ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{c.code}</span>
                      {c.isHeadquarters && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                          Sede Central
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">{c.name}</h2>
                    <div className="text-xs text-amber-800 font-medium mt-0.5">
                      Pastor Dirigente: <strong>{c.seniorPastor}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    title="Editar informações da congregação"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address} - {c.neighborhood}, {c.city}/{c.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.phone}</span>
                    {c.email && (
                      <>
                        <span className="text-slate-300">·</span>
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Fundação: {c.foundationDate} · Capacidade: {c.capacity} pessoas</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500">Total Vinculados</span>
                    <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{congregationMembers.length}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500">Membros Ativos</span>
                    <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">{activeMembersCount}</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500">Corpo Obreiros</span>
                    <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">{workersCount}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveCongregationId(c.id);
                    setActiveView('members');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  Ver Membros Desta Congregação &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingId ? 'Editar Congregação' : 'Nova Congregação / Filial'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código Identificador *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo da Unidade</label>
                <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isHeadquarters}
                    onChange={(e) => setIsHeadquarters(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>É a Sede Geral da Igreja</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nome Oficial da Congregação *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Congregação Betel (Zona Norte)"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Pastor / Ministro Dirigente *</label>
                <input
                  type="text"
                  required
                  value={seniorPastor}
                  onChange={(e) => setSeniorPastor(e.target.value)}
                  placeholder="Nome do pastor responsável..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Endereço (Rua, Número)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacidade de Pessoas</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                Salvar Congregação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
