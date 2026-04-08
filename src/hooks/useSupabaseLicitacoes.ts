import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Licitacao, ColunaKanban, StatusLicitacao, ModalidadeLicitacao, ModoDisputa, PortalDisputa } from '@/types/licitacao';
import { toast } from '@/hooks/use-toast';

// Mapeamento coluna → status
const COLUNA_STATUS_MAP: Record<ColunaKanban, StatusLicitacao> = {
  captacao: 'falta_cadastrar',
  analise: 'em_analise',
  montagem: 'cadastrada',
  pregao: 'cadastrada',
  recurso: 'em_analise',
};

function mapRowToLicitacao(row: any): Licitacao {
  return {
    id: row.id,
    orgaoComprador: row.orgao_nome,
    modalidade: row.modalidade as ModalidadeLicitacao,
    numeroEdital: row.numero_edital,
    objeto: row.objeto,
    dataLicitacao: row.data_licitacao,
    horaLicitacao: row.hora_licitacao,
    modoDisputa: row.modo_disputa as ModoDisputa | undefined,
    valorReferencia: row.valor_referencia ?? undefined,
    portalDisputa: row.portal_disputa as PortalDisputa | undefined,
    status: row.status as StatusLicitacao,
    colunaKanban: (row.coluna_kanban || 'captacao') as ColunaKanban,
    linkAcesso: row.link_acesso ?? undefined,
    observacoes: row.observacoes ?? undefined,
    checklistCompleto: row.checklist_completo ?? false,
    documentosAnexados: 0,
    documentosNecessarios: 8,
    empresaId: row.empresa_id,
    criadoEm: row.criado_em,
  };
}

export function useSupabaseLicitacoes() {
  const { user } = useAuth();
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLicitacoes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('licitacoes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar licitações:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar as licitações.', variant: 'destructive' });
    } else {
      setLicitacoes((data || []).map(mapRowToLicitacao));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLicitacoes();
  }, [fetchLicitacoes]);

  const moverColuna = async (licitacaoId: string, novaColuna: ColunaKanban) => {
    const lic = licitacoes.find(l => l.id === licitacaoId);
    if (!lic) return;

    if (novaColuna === 'pregao' && !lic.checklistCompleto) {
      toast({ title: 'Bloqueado', description: 'Complete o checklist de documentos antes de mover para o Dia do Pregão.', variant: 'destructive' });
      return false;
    }

    const novoStatus = COLUNA_STATUS_MAP[novaColuna];
    const { error } = await supabase
      .from('licitacoes')
      .update({ coluna_kanban: novaColuna, status: novoStatus })
      .eq('id', licitacaoId);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao mover licitação.', variant: 'destructive' });
      return false;
    }

    setLicitacoes(prev =>
      prev.map(l => l.id === licitacaoId ? { ...l, colunaKanban: novaColuna, status: novoStatus } : l)
    );
    return true;
  };

  const criarLicitacao = async (dados: {
    orgaoComprador: string;
    modalidade: ModalidadeLicitacao;
    numeroEdital: string;
    objeto: string;
    dataLicitacao: string;
    horaLicitacao: string;
    modoDisputa?: ModoDisputa;
    valorReferencia?: number;
    portalDisputa?: PortalDisputa;
    linkAcesso?: string;
    observacoes?: string;
    colunaKanban?: ColunaKanban;
  }) => {
    if (!user) return null;

    // Get empresa_id
    const { data: empresaData } = await supabase.rpc('get_user_empresa_id', { _user_id: user.id });

    if (!empresaData) {
      toast({ title: 'Erro', description: 'Empresa não encontrada. Verifique seu perfil.', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('licitacoes')
      .insert({
        empresa_id: empresaData,
        orgao_nome: dados.orgaoComprador,
        modalidade: dados.modalidade,
        numero_edital: dados.numeroEdital,
        objeto: dados.objeto,
        data_licitacao: dados.dataLicitacao,
        hora_licitacao: dados.horaLicitacao,
        modo_disputa: dados.modoDisputa || null,
        valor_referencia: dados.valorReferencia || null,
        portal_disputa: dados.portalDisputa || null,
        link_acesso: dados.linkAcesso || null,
        observacoes: dados.observacoes || null,
        coluna_kanban: dados.colunaKanban || 'captacao',
        status: COLUNA_STATUS_MAP[dados.colunaKanban || 'captacao'],
        criado_por: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar licitação: ' + error.message, variant: 'destructive' });
      return null;
    }

    const novaLic = mapRowToLicitacao(data);
    setLicitacoes(prev => [novaLic, ...prev]);
    toast({ title: 'Sucesso!', description: 'Licitação criada com sucesso.' });
    return novaLic;
  };

  const atualizarLicitacao = async (id: string, campos: Record<string, any>) => {
    const { error } = await supabase
      .from('licitacoes')
      .update(campos as any)
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar licitação.', variant: 'destructive' });
      return false;
    }

    await fetchLicitacoes();
    return true;
  };

  return { licitacoes, loading, fetchLicitacoes, moverColuna, criarLicitacao, atualizarLicitacao };
}
