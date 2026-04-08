export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contratos: {
        Row: {
          criado_em: string | null
          data_fim: string
          data_inicio: string
          empresa_id: string
          id: string
          licitacao_id: string | null
          numero_ata: string
          objeto: string
          orgao: string
          status: string | null
          valor_total: number
          valor_utilizado: number | null
        }
        Insert: {
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          empresa_id: string
          id?: string
          licitacao_id?: string | null
          numero_ata: string
          objeto: string
          orgao: string
          status?: string | null
          valor_total: number
          valor_utilizado?: number | null
        }
        Update: {
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          empresa_id?: string
          id?: string
          licitacao_id?: string | null
          numero_ata?: string
          objeto?: string
          orgao?: string
          status?: string | null
          valor_total?: number
          valor_utilizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          arquivo_url: string
          criado_em: string | null
          data_validade: string | null
          empresa_id: string
          id: string
          licitacao_id: string | null
          nome: string
          status: string | null
          tamanho_kb: number | null
          tipo: string
        }
        Insert: {
          arquivo_url: string
          criado_em?: string | null
          data_validade?: string | null
          empresa_id: string
          id?: string
          licitacao_id?: string | null
          nome: string
          status?: string | null
          tamanho_kb?: number | null
          tipo: string
        }
        Update: {
          arquivo_url?: string
          criado_em?: string | null
          data_validade?: string | null
          empresa_id?: string
          id?: string
          licitacao_id?: string | null
          nome?: string
          status?: string | null
          tamanho_kb?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          cnpj: string
          criado_em: string | null
          email_contato: string | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj: string
          criado_em?: string | null
          email_contato?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string
          criado_em?: string | null
          email_contato?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
        }
        Relationships: []
      }
      eventos_calendario: {
        Row: {
          cor: string | null
          criado_em: string | null
          data: string
          empresa_id: string
          id: string
          licitacao_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          cor?: string | null
          criado_em?: string | null
          data: string
          empresa_id: string
          id?: string
          licitacao_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          cor?: string | null
          criado_em?: string | null
          data?: string
          empresa_id?: string
          id?: string
          licitacao_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_calendario_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_calendario_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_ata: {
        Row: {
          contrato_id: string
          descricao: string
          id: string
          preco_unitario: number
          quantidade_total: number
          quantidade_utilizada: number | null
          unidade: string
        }
        Insert: {
          contrato_id: string
          descricao: string
          id?: string
          preco_unitario: number
          quantidade_total: number
          quantidade_utilizada?: number | null
          unidade: string
        }
        Update: {
          contrato_id?: string
          descricao?: string
          id?: string
          preco_unitario?: number
          quantidade_total?: number
          quantidade_utilizada?: number | null
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_ata_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      licitacoes: {
        Row: {
          atualizado_em: string | null
          checklist_completo: boolean | null
          coluna_kanban: Database["public"]["Enums"]["coluna_kanban"] | null
          criado_em: string | null
          criado_por: string | null
          data_licitacao: string
          empresa_id: string
          hora_licitacao: string
          id: string
          link_acesso: string | null
          modalidade: Database["public"]["Enums"]["modalidade_licitacao"]
          modo_disputa: Database["public"]["Enums"]["modo_disputa"] | null
          numero_edital: string
          objeto: string
          observacoes: string | null
          orgao_nome: string
          portal_disputa: Database["public"]["Enums"]["portal_disputa"] | null
          status: Database["public"]["Enums"]["status_licitacao"] | null
          valor_referencia: number | null
        }
        Insert: {
          atualizado_em?: string | null
          checklist_completo?: boolean | null
          coluna_kanban?: Database["public"]["Enums"]["coluna_kanban"] | null
          criado_em?: string | null
          criado_por?: string | null
          data_licitacao: string
          empresa_id: string
          hora_licitacao: string
          id?: string
          link_acesso?: string | null
          modalidade: Database["public"]["Enums"]["modalidade_licitacao"]
          modo_disputa?: Database["public"]["Enums"]["modo_disputa"] | null
          numero_edital: string
          objeto: string
          observacoes?: string | null
          orgao_nome: string
          portal_disputa?: Database["public"]["Enums"]["portal_disputa"] | null
          status?: Database["public"]["Enums"]["status_licitacao"] | null
          valor_referencia?: number | null
        }
        Update: {
          atualizado_em?: string | null
          checklist_completo?: boolean | null
          coluna_kanban?: Database["public"]["Enums"]["coluna_kanban"] | null
          criado_em?: string | null
          criado_por?: string | null
          data_licitacao?: string
          empresa_id?: string
          hora_licitacao?: string
          id?: string
          link_acesso?: string | null
          modalidade?: Database["public"]["Enums"]["modalidade_licitacao"]
          modo_disputa?: Database["public"]["Enums"]["modo_disputa"] | null
          numero_edital?: string
          objeto?: string
          observacoes?: string | null
          orgao_nome?: string
          portal_disputa?: Database["public"]["Enums"]["portal_disputa"] | null
          status?: Database["public"]["Enums"]["status_licitacao"] | null
          valor_referencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "licitacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          criado_em: string | null
          empresa_id: string | null
          id: string
          nome_completo: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id: string
          nome_completo: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          nome_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          concluida: boolean | null
          criado_em: string | null
          id: string
          licitacao_id: string
          prazo: string | null
          responsavel_id: string | null
          titulo: string
        }
        Insert: {
          concluida?: boolean | null
          criado_em?: string | null
          id?: string
          licitacao_id: string
          prazo?: string | null
          responsavel_id?: string | null
          titulo: string
        }
        Update: {
          concluida?: boolean | null
          criado_em?: string | null
          id?: string
          licitacao_id?: string
          prazo?: string | null
          responsavel_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin_master" | "analista" | "cliente_visualizador"
      coluna_kanban: "captacao" | "analise" | "montagem" | "pregao" | "recurso"
      modalidade_licitacao:
        | "pregao_eletronico"
        | "concorrencia"
        | "dispensa_eletronica"
        | "inexigibilidade"
        | "tomada_precos"
      modo_disputa: "aberto" | "fechado" | "aberto_fechado"
      portal_disputa:
        | "comprasnet"
        | "licitacoes_e"
        | "portal_compras_publicas"
        | "bll"
        | "outro"
      status_licitacao:
        | "falta_cadastrar"
        | "em_analise"
        | "cadastrada"
        | "ganha"
        | "perdida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_master", "analista", "cliente_visualizador"],
      coluna_kanban: ["captacao", "analise", "montagem", "pregao", "recurso"],
      modalidade_licitacao: [
        "pregao_eletronico",
        "concorrencia",
        "dispensa_eletronica",
        "inexigibilidade",
        "tomada_precos",
      ],
      modo_disputa: ["aberto", "fechado", "aberto_fechado"],
      portal_disputa: [
        "comprasnet",
        "licitacoes_e",
        "portal_compras_publicas",
        "bll",
        "outro",
      ],
      status_licitacao: [
        "falta_cadastrar",
        "em_analise",
        "cadastrada",
        "ganha",
        "perdida",
      ],
    },
  },
} as const
