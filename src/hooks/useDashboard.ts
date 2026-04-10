import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProximaLicitacao {
  id: string;
  orgao_nome: string;
  modalidade: string;
  numero_edital: string;
  data_licitacao: string;
  hora_licitacao: string;
  status: string;
  checklist_completo: boolean;
  valor_referencia: number | null;
}

interface Pendencia {
  id: string;
  numero_edital: string;
  orgao_nome: string;
  data_licitacao: string;
}

interface DocAlerta {
  id: string;
  nome: string;
  data_validade: string | null;
  status: string | null;
}

interface ContratoVigente {
  id: string;
  orgao: string;
  numero_ata: string;
  valor_total: number;
  valor_utilizado: number | null;
}

export interface DashboardData {
  totalLicitacoes: number;
  valorDisputado: number;
  valorGanho: number;
  taxaSucesso: number;
  pendencias: number;
  licitacoesEsteMes: number;
  proximas: ProximaLicitacao[];
  pendenciasLista: Pendencia[];
  docsAlerta: DocAlerta[];
  contratosVigentes: ContratoVigente[];
}

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchDashboard() {
      setIsLoading(true);
      try {
        // Get empresa_id
        const { data: empresaId } = await supabase.rpc('get_user_empresa_id', {
          _user_id: user!.id,
        });

        if (!empresaId || cancelled) return;

        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = `${hoje.slice(0, 7)}-01`;
        const em15Dias = new Date();
        em15Dias.setDate(em15Dias.getDate() + 15);
        const dataLimite = em15Dias.toISOString().split('T')[0];

        // Parallel queries
        const [
          allLicRes,
          proximasRes,
          pendenciasRes,
          docsRes,
          contratosRes,
        ] = await Promise.all([
          // All licitacoes for metrics
          supabase
            .from('licitacoes')
            .select('id, status, valor_referencia, criado_em')
            .eq('empresa_id', empresaId),

          // Next 5 upcoming
          supabase
            .from('licitacoes')
            .select('id, orgao_nome, modalidade, numero_edital, data_licitacao, hora_licitacao, status, checklist_completo, valor_referencia')
            .eq('empresa_id', empresaId)
            .gte('data_licitacao', hoje)
            .order('data_licitacao', { ascending: true })
            .limit(5),

          // Pendencias: checklist incompleto e data futura
          supabase
            .from('licitacoes')
            .select('id, numero_edital, orgao_nome, data_licitacao')
            .eq('empresa_id', empresaId)
            .eq('checklist_completo', false)
            .gte('data_licitacao', hoje),

          // Docs vencendo em 15 dias
          supabase
            .from('documentos')
            .select('id, nome, data_validade, status')
            .eq('empresa_id', empresaId)
            .not('data_validade', 'is', null)
            .lte('data_validade', dataLimite),

          // Contratos vigentes
          supabase
            .from('contratos')
            .select('id, orgao, numero_ata, valor_total, valor_utilizado')
            .eq('empresa_id', empresaId)
            .eq('status', 'vigente'),
        ]);

        if (cancelled) return;

        const allLic = allLicRes.data || [];
        const total = allLic.length;
        const ganhas = allLic.filter(l => l.status === 'ganha').length;
        const valorDisputado = allLic.reduce((s, l) => s + (l.valor_referencia || 0), 0);
        const valorGanho = allLic
          .filter(l => l.status === 'ganha')
          .reduce((s, l) => s + (l.valor_referencia || 0), 0);
        const taxaSucesso = total > 0 ? Math.round((ganhas / total) * 100) : 0;

        const licitacoesEsteMes = allLic.filter(l => {
          const criado = l.criado_em?.slice(0, 10) || '';
          return criado >= inicioMes;
        }).length;

        const pendenciasLista = pendenciasRes.data || [];

        setData({
          totalLicitacoes: total,
          valorDisputado,
          valorGanho,
          taxaSucesso,
          pendencias: pendenciasLista.length,
          licitacoesEsteMes,
          proximas: (proximasRes.data || []) as ProximaLicitacao[],
          pendenciasLista,
          docsAlerta: (docsRes.data || []) as DocAlerta[],
          contratosVigentes: (contratosRes.data || []) as ContratoVigente[],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, [user]);

  return { data, isLoading };
}
