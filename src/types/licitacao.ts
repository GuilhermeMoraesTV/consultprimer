// === Tipos do sistema LicitaMax ===
// Todos os tipos e interfaces centralizados

/** Status possíveis de uma licitação */
export type StatusLicitacao = 
  | 'falta_cadastrar'
  | 'em_analise' 
  | 'cadastrada' 
  | 'ganha' 
  | 'perdida';

/** Modalidades de licitação conforme Lei 14.133/21 */
export type ModalidadeLicitacao = 
  | 'pregao_eletronico'
  | 'concorrencia'
  | 'dispensa_eletronica'
  | 'inexigibilidade'
  | 'tomada_precos';

/** Modo de disputa */
export type ModoDisputa = 'aberto' | 'fechado' | 'aberto_fechado';

/** Colunas do Kanban representando o funil */
export type ColunaKanban = 
  | 'captacao'
  | 'analise'
  | 'montagem'
  | 'pregao'
  | 'recurso';

/** Portais de disputa eletrônica */
export type PortalDisputa = 
  | 'comprasnet'
  | 'licitacoes_e'
  | 'portal_compras_publicas'
  | 'bll'
  | 'outro';

/** Licitação completa */
export interface Licitacao {
  id: string;
  orgaoComprador: string;
  modalidade: ModalidadeLicitacao;
  numeroEdital: string;
  objeto: string;
  dataLicitacao: string;
  horaLicitacao: string;
  modoDisputa?: ModoDisputa;
  valorReferencia?: number;
  portalDisputa?: PortalDisputa;
  status: StatusLicitacao;
  colunaKanban: ColunaKanban;
  linkAcesso?: string;
  observacoes?: string;
  checklistCompleto: boolean;
  documentosAnexados: number;
  documentosNecessarios: number;
  empresaId: string;
  criadoEm: string;
}

/** Evento do calendário */
export interface EventoCalendario {
  id: string;
  titulo: string;
  data: Date;
  tipo: 'pregao' | 'impugnacao' | 'amostra' | 'certidao';
  licitacaoId?: string;
  cor: string;
}

/** Métricas do dashboard */
export interface MetricasDashboard {
  totalLicitacoes: number;
  valorDisputado: number;
  valorGanho: number;
  taxaSucesso: number;
  pendencias: number;
  licitacoesEsteMes: number;
}

/** Labels legíveis para modalidades */
export const MODALIDADE_LABELS: Record<ModalidadeLicitacao, string> = {
  pregao_eletronico: 'Pregão Eletrônico',
  concorrencia: 'Concorrência',
  dispensa_eletronica: 'Dispensa Eletrônica',
  inexigibilidade: 'Inexigibilidade',
  tomada_precos: 'Tomada de Preços',
};

/** Labels legíveis para status */
export const STATUS_LABELS: Record<StatusLicitacao, string> = {
  falta_cadastrar: 'Falta Cadastrar',
  em_analise: 'Em Análise',
  cadastrada: 'Cadastrada',
  ganha: 'Ganha',
  perdida: 'Perdida',
};

/** Labels das colunas do Kanban */
export const COLUNA_LABELS: Record<ColunaKanban, string> = {
  captacao: 'Captação',
  analise: 'Análise',
  montagem: 'Montagem',
  pregao: 'Dia do Pregão',
  recurso: 'Recurso / Adjudicação',
};

/** Labels dos portais */
export const PORTAL_LABELS: Record<PortalDisputa, string> = {
  comprasnet: 'ComprasNet',
  licitacoes_e: 'Licitações-e',
  portal_compras_publicas: 'Portal de Compras Públicas',
  bll: 'BLL',
  outro: 'Outro',
};
