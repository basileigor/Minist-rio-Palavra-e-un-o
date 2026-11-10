/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { calculateAge, formatDateBR, formatPhone, exportToCSV } from '../../utils/formatters.ts';

export const ReportsView: React.FC = () => {
  const { members, congregations, settings, currentUserRole, setSelectedMemberId, setActiveView } = useChurch();

  const [selectedReportId, setSelectedReportId] = useState<number>(1);

  const reportList = [
    { id: 1, title: '1. Relação Geral de Membros', desc: 'Relação completa de todas as pessoas cadastradas no rol eclesiástico.' },
    { id: 2, title: '2. Ficha Individual Completa', desc: 'Prontuário eclesiástico individual completo para arquivo pastoral e arquivo morto.' },
    { id: 3, title: '3. Relação de Membros por Congregação', desc: 'Quadro de membresia distribuído por filial e congregação.' },
    { id: 4, title: '4. Relação de Membros por Departamento', desc: 'Participação ativa nos ministérios e departamentos da igreja.' },
    { id: 5, title: '5. Relação de Pastores e Obreiros', desc: 'Relação do corpo ministerial: pastores, presbíteros, diáconos e evangelistas.' },
    { id: 6, title: '6. Relação de Membros Batizados', desc: 'Relação dos membros que já desceram às águas batismais com data e certificado.' },
    { id: 7, title: '7. Relação de Membros Não Batizados', desc: 'Pessoas e novos convertidos em preparação para o batismo nas águas.' },
    { id: 8, title: '8. Relação de Novos Convertidos', desc: 'Pessoas que aceitaram Jesus Cristo e estão em processo de integração e discipulado.' },
    { id: 9, title: '9. Relação de Membros Afastados', desc: 'Membros inativos ou necessitando de visitação pastoral e reconciliação.' },
    { id: 10, title: '10. Relação de Aniversariantes', desc: 'Aniversariantes do mês e aniversários de casamento.' },
    { id: 11, title: '11. Relação de Famílias Cadastradas', desc: 'Mapeamento dos núcleos familiares, casais e dependentes.' },
    { id: 12, title: '12. Relação de Líderes e Respectivos Cargos', desc: 'Liderança oficial de departamentos e ministérios da instituição.' },
    { id: 13, title: '13. Histórico de Transferências', desc: 'Movimentações entre filiais e cartas de transferência eclesiásticas.' },
    { id: 14, title: '14. Histórico de Consagrações', desc: 'Registro cronológico de ordenações ministeriais e autoridades ordenadoras.' },
    { id: 15, title: '15. Relatório de Crescimento da Igreja', desc: 'Evolução quantitativa da membresia por período e congregações.' },
    { id: 16, title: '16. Relatório de Acompanhamento Pastoral', desc: 'Atendimentos de gabinete, visitas e orientações espirituais (Acesso Restrito).' },
  ];

  // Base list of members across the institution
  const scopedMembers = members;

  // Compute active report data
  const reportData = useMemo(() => {
    switch (selectedReportId) {
      case 1: // Relação Geral
        return {
          headers: ['Matrícula', 'Nome Completo', 'Cargo', 'Situação', 'Congregação', 'Telefone', 'Idade'],
          rows: scopedMembers.map((m) => {
            const cong = congregations.find((c) => c.id === m.currentCongregationId);
            return [
              m.registrationNumber,
              m.fullName,
              m.currentMinisterialRole,
              m.currentStatus,
              cong?.name || 'Sede',
              formatPhone(m.primaryPhone),
              `${calculateAge(m.birthDate)} anos`,
            ];
          }),
        };

      case 3: // Por congregação
        return {
          headers: ['Congregação', 'Matrícula', 'Nome Completo', 'Situação', 'Telefone', 'Admissão'],
          rows: scopedMembers.map((m) => {
            const cong = congregations.find((c) => c.id === m.currentCongregationId);
            return [
              cong?.name || 'Sede',
              m.registrationNumber,
              m.fullName,
              m.currentStatus,
              formatPhone(m.primaryPhone),
              formatDateBR(m.admissionDate),
            ];
          }),
        };

      case 4: // Por departamento
        {
          const rows: string[][] = [];
          scopedMembers.forEach((m) => {
            m.ministries.forEach((min) => {
              rows.push([
                String(min.departmentName),
                m.fullName,
                min.roleHeld,
                min.isCurrent ? 'Ativo' : 'Encerrado',
                formatDateBR(min.startDate),
              ]);
            });
          });
          return {
            headers: ['Departamento / Ministério', 'Nome do Membro', 'Função', 'Status', 'Início'],
            rows,
          };
        }

      case 5: // Pastores e Obreiros
        return {
          headers: ['Matrícula', 'Nome do Obreiro', 'Cargo Ministerial', 'Congregação', 'Credencial', 'Última Consagração'],
          rows: scopedMembers
            .filter((m) => m.currentMinisterialRole !== 'Membro')
            .map((m) => {
              const cong = congregations.find((c) => c.id === m.currentCongregationId);
              const lastOrd = m.ordinations[0];
              return [
                m.registrationNumber,
                m.fullName,
                m.currentMinisterialRole,
                cong?.name || 'Sede',
                m.leadershipExperience.hasMinisterialCredentials ? m.leadershipExperience.credentialsNumber || 'Sim' : 'Pendente',
                lastOrd ? `${lastOrd.roleTitle} (${formatDateBR(lastOrd.ordinationDate)})` : 'Histórico em arquivo',
              ];
            }),
        };

      case 6: // Batizados
        return {
          headers: ['Matrícula', 'Nome Completo', 'Data Batismo', 'Igreja / Local', 'Pastor Celebrante', 'Certificado'],
          rows: scopedMembers
            .filter((m) => m.isWaterBaptized)
            .map((m) => [
              m.registrationNumber,
              m.fullName,
              formatDateBR(m.waterBaptismDate),
              m.waterBaptismChurch || 'Templo Central',
              m.officiatingPastor || 'Pastor Titular',
              m.baptismCertificateNumber || 'Arquivado',
            ]),
        };

      case 7: // Não batizados
        return {
          headers: ['Matrícula', 'Nome Completo', 'Situação', 'Data de Conversão', 'Telefone', 'Observação'],
          rows: scopedMembers
            .filter((m) => !m.isWaterBaptized)
            .map((m) => [
              m.registrationNumber,
              m.fullName,
              m.currentStatus,
              formatDateBR(m.conversionDate),
              formatPhone(m.primaryPhone),
              m.waterBaptismNotes || 'Candidato à próxima turma de batismo',
            ]),
        };

      case 8: // Novos Convertidos
        return {
          headers: ['Matrícula', 'Nome', 'Data da Conversão', 'Discipulador / Mentor', 'Telefone', 'Congregação'],
          rows: scopedMembers
            .filter((m) => m.currentStatus === 'Novo Convertido' || m.currentStatus === 'Membro em Integração')
            .map((m) => {
              const cong = congregations.find((c) => c.id === m.currentCongregationId);
              return [
                m.registrationNumber,
                m.fullName,
                formatDateBR(m.conversionDate),
                m.mentoredBy || 'Acompanhamento Pastoral',
                formatPhone(m.primaryPhone),
                cong?.name || 'Sede',
              ];
            }),
        };

      case 9: // Afastados
        return {
          headers: ['Matrícula', 'Nome', 'Último Contato', 'Telefone', 'Endereço', 'Pastor Responsável'],
          rows: scopedMembers
            .filter((m) => m.currentStatus === 'Membro Afastado')
            .map((m) => [
              m.registrationNumber,
              m.fullName,
              formatDateBR(m.lastPastoralContactDate),
              formatPhone(m.primaryPhone),
              `${m.neighborhood}, ${m.city}`,
              m.assignedPastor || 'Gabinete Pastoral',
            ]),
        };

      case 10: // Aniversariantes
        return {
          headers: ['Nome Completo', 'Data Nasc.', 'Idade', 'Telefone / WhatsApp', 'Congregação'],
          rows: scopedMembers.map((m) => {
            const cong = congregations.find((c) => c.id === m.currentCongregationId);
            return [
              m.fullName,
              formatDateBR(m.birthDate),
              `${calculateAge(m.birthDate)} anos`,
              formatPhone(m.primaryPhone),
              cong?.name || 'Sede',
            ];
          }),
        };

      case 11: // Famílias
        return {
          headers: ['Titular Familiar', 'Cônjuge', 'Data Casamento', 'Filhos Cadastrados', 'Telefone'],
          rows: scopedMembers
            .filter((m) => m.spouseName || m.children.length > 0)
            .map((m) => [
              m.fullName,
              m.spouseName || 'Solteiro(a)',
              formatDateBR(m.marriageDate),
              `${m.children.length} filho(s)`,
              formatPhone(m.primaryPhone),
            ]),
        };

      case 13: // Transferências
        {
          const rows: string[][] = [];
          scopedMembers.forEach((m) => {
            m.congregationTransfers.forEach((tr) => {
              rows.push([
                m.fullName,
                tr.fromCongregationName || 'Origem',
                tr.toCongregationName,
                formatDateBR(tr.transferDate),
                tr.reason || 'Transferência',
              ]);
            });
          });
          return {
            headers: ['Nome do Membro', 'Congregação de Origem', 'Congregação de Destino', 'Data', 'Motivo'],
            rows,
          };
        }

      case 14: // Consagrações
        {
          const rows: string[][] = [];
          scopedMembers.forEach((m) => {
            m.ordinations.forEach((ord) => {
              rows.push([
                m.fullName,
                ord.roleTitle,
                formatDateBR(ord.ordinationDate),
                ord.ordainingAuthority,
                ord.ordainingChurch,
                ord.certificateNumber || 'Arquivado',
              ]);
            });
          });
          return {
            headers: ['Obreiro(a)', 'Função Ordenada', 'Data Consagração', 'Autoridade Celebrante', 'Igreja', 'Certificado'],
            rows,
          };
        }

      case 16: // Pastoral
        {
          const rows: string[][] = [];
          scopedMembers.forEach((m) => {
            m.pastoralCareRecords.forEach((care) => {
              rows.push([
                m.fullName,
                care.serviceType,
                care.subject,
                formatDateBR(care.date),
                care.pastorName,
                care.confidentialityLevel,
              ]);
            });
          });
          return {
            headers: ['Pessoa Atendida', 'Tipo', 'Assunto Tratado', 'Data', 'Pastor Responsável', 'Sigilo'],
            rows,
          };
        }

      default:
        return {
          headers: ['Matrícula', 'Nome Completo', 'Cargo', 'Situação'],
          rows: scopedMembers.map((m) => [m.registrationNumber, m.fullName, m.currentMinisterialRole, m.currentStatus]),
        };
    }
  }, [scopedMembers, selectedReportId, congregations]);

  const handleExportCSV = () => {
    const reportName = reportList.find((r) => r.id === selectedReportId)?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'relatorio';
    exportToCSV(`${reportName}_${new Date().toISOString().split('T')[0]}`, reportData.headers, reportData.rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Relatórios Eclesiásticos Oficiais
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geração de relatórios gerenciais e estatísticos em conformidade com o regimento institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Reports Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Selecione o Relatório Eclesiástico Oficial:</label>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(Number(e.target.value))}
            className="w-full py-2.5 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
          >
            {reportList.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 pt-1">
          {reportList.find((r) => r.id === selectedReportId)?.desc}
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs print-shadow-none space-y-6">
        {/* Printable Official Letterhead */}
        <div className="pb-4 border-b-2 border-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
              alt="Logotipo Ministério Palavra e Unção"
              className="w-14 h-14 rounded-lg object-cover border border-amber-400 shrink-0 shadow-xs"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                {settings.name}
              </h2>
              <div className="text-[11px] text-slate-600 font-mono">
                CNPJ: {settings.cnpj} · {settings.headquartersAddress}
              </div>
              <div className="text-[10px] text-slate-500">
                Presidente: {settings.seniorPastorPresident} · Secretaria Geral Eclesiástica
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono text-slate-400">Emissão Oficial</div>
            <div className="font-bold text-slate-900 font-mono">{new Date().toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 uppercase">
            {reportList.find((r) => r.id === selectedReportId)?.title}
          </h3>
          <span className="text-xs font-mono text-slate-600">
            Total de Registros: <strong>{reportData.rows.length}</strong>
          </span>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="py-8 text-center text-slate-500">
                    Nenhum registro para este relatório com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3 text-slate-800">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section for Printing */}
        <div className="pt-12 mt-12 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div>
            <div className="w-48 mx-auto border-t border-slate-400 pt-1 font-semibold text-slate-900">
              Secretaria Geral
            </div>
            <div className="text-[10px] text-slate-500">Responsável pelo Rol de Membresia</div>
          </div>
          <div>
            <div className="w-48 mx-auto border-t border-slate-400 pt-1 font-semibold text-slate-900">
              Pastor Presidente
            </div>
            <div className="text-[10px] text-slate-500">Visto Pastoral Homologado</div>
          </div>
        </div>
      </div>
    </div>
  );
};
