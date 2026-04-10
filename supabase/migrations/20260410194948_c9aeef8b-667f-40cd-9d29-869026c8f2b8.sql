-- Add new columns to licitacoes
ALTER TABLE public.licitacoes ADD COLUMN IF NOT EXISTS uasg varchar(10);
ALTER TABLE public.licitacoes ADD COLUMN IF NOT EXISTS data_impugnacao date;
ALTER TABLE public.licitacoes ADD COLUMN IF NOT EXISTS criterio_julgamento varchar;
ALTER TABLE public.licitacoes ADD COLUMN IF NOT EXISTS analista_responsavel uuid;

-- Create itens_licitacao table
CREATE TABLE IF NOT EXISTS public.itens_licitacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacao_id uuid NOT NULL REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  codigo varchar,
  descricao text NOT NULL,
  unidade varchar(20),
  quantidade numeric,
  valor_unitario numeric
);

-- Enable RLS
ALTER TABLE public.itens_licitacao ENABLE ROW LEVEL SECURITY;

-- RLS policy: tenant isolation via licitacao_id
CREATE POLICY "tenant_itens_licitacao" ON public.itens_licitacao
  FOR ALL
  TO authenticated
  USING (
    licitacao_id IN (
      SELECT id FROM public.licitacoes
      WHERE empresa_id = get_user_empresa_id(auth.uid())
    )
  )
  WITH CHECK (
    licitacao_id IN (
      SELECT id FROM public.licitacoes
      WHERE empresa_id = get_user_empresa_id(auth.uid())
    )
  );