// === Tipos do sistema ConsultPrimer ===
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

/** Tipo de documento */
export type TipoDocumento =
  | 'edital'
  | 'termo_referencia'
  | 'contrato_social'
  | 'balanco_patrimonial'
  | 'certidao_federal'
  | 'certidao_estadual'
  | 'certidao_municipal'
  | 'certidao_fgts'
  | 'certidao_trabalhista'
  | 'sicaf'
  | 'proposta'
  | 'outro';

/** Labels dos documentos */
export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  edital: 'Edital',
  termo_referencia: 'Termo de Referência',
  contrato_social: 'Contrato Social',
  balanco_patrimonial: 'Balanço Patrimonial',
  certidao_federal: 'CND Federal',
  certidao_estadual: 'CND Estadual',
  certidao_municipal: 'CND Municipal',
  certidao_fgts: 'Certidão FGTS',
  certidao_trabalhista: 'Certidão Trabalhista',
  sicaf: 'SICAF',
  proposta: 'Proposta Comercial',
  outro: 'Outro',
};

/** Documento da empresa */
export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  arquivoUrl: string;
  tamanhoKb: number;
  dataUpload: string;
  dataValidade?: string;
  licitacaoId?: string;
  empresaId: string;
  status: 'ativo' | 'vencido' | 'proximo_vencer';
}

/** Item de Ata SRP */
export interface ItemAta {
  id: string;
  descricao: string;
  unidade: string;
  quantidadeTotal: number;
  quantidadeUtilizada: number;
  precoUnitario: number;
}

/** Contrato / Ata de Registro de Preços */
export interface Contrato {
  id: string;
  licitacaoId: string;
  orgao: string;
  numeroAta: string;
  objeto: string;
  valorTotal: number;
  valorUtilizado: number;
  dataInicio: string;
  dataFim: string;
  status: 'vigente' | 'vencida' | 'encerrada';
  itens: ItemAta[];
  empresaId: string;
}

/** Dados de concorrente para analytics */
export interface DadosConcorrente {
  empresa: string;
  vitorias: number;
  derrotas: number;
  valorMedioDesagio: number;
}

/** Labels de modo de disputa */
export const MODO_DISPUTA_LABELS: Record<ModoDisputa, string> = {
  aberto: 'Aberto',
  fechado: 'Fechado',
  aberto_fechado: 'Aberto/Fechado',
};
