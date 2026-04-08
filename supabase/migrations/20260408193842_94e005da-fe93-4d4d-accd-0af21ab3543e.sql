
-- Expandir tabela empresas com campos adicionais
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS inscricao_estadual varchar,
  ADD COLUMN IF NOT EXISTS inscricao_municipal varchar,
  ADD COLUMN IF NOT EXISTS endereco_rua varchar,
  ADD COLUMN IF NOT EXISTS endereco_numero varchar,
  ADD COLUMN IF NOT EXISTS endereco_bairro varchar,
  ADD COLUMN IF NOT EXISTS endereco_cidade varchar,
  ADD COLUMN IF NOT EXISTS endereco_estado varchar(2),
  ADD COLUMN IF NOT EXISTS endereco_cep varchar(9),
  ADD COLUMN IF NOT EXISTS banco varchar,
  ADD COLUMN IF NOT EXISTS agencia varchar,
  ADD COLUMN IF NOT EXISTS conta varchar,
  ADD COLUMN IF NOT EXISTS chave_pix varchar,
  ADD COLUMN IF NOT EXISTS regime_tributario varchar,
  ADD COLUMN IF NOT EXISTS socio_responsavel varchar,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cabecalho_proposta jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bloco_assinatura jsonb DEFAULT '{}';

-- Permitir UPDATE na tabela empresas para membros da empresa
CREATE POLICY "tenant_empresas_update"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (id = get_user_empresa_id(auth.uid()))
  WITH CHECK (id = get_user_empresa_id(auth.uid()));

-- Criar tabela de produtos/serviços
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  codigo_sku varchar NOT NULL,
  descricao text NOT NULL,
  marca varchar,
  unidade_medida varchar NOT NULL DEFAULT 'UN',
  custo_padrao numeric DEFAULT 0,
  margem_lucro numeric DEFAULT 0,
  ncm_codigo varchar,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- RLS para produtos
CREATE POLICY "tenant_produtos"
  ON public.produtos FOR ALL
  TO authenticated
  USING (empresa_id = get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = get_user_empresa_id(auth.uid()));

-- Trigger updated_at para produtos
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
