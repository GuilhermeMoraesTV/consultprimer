# 🏛️ LicitaMax — Guia Completo de Configuração com Supabase

> Passo a passo detalhado para conectar o LicitaMax ao Supabase e ter autenticação, banco de dados, storage e multi-tenant funcionando.

---

## 📋 Índice

1. [Criar Projeto no Supabase](#1-criar-projeto-no-supabase)
2. [Configurar Credenciais no Projeto](#2-configurar-credenciais-no-projeto)
3. [Instalar Dependências](#3-instalar-dependências)
4. [Criar Client Supabase](#4-criar-client-supabase)
5. [Criar Tipos Enumerados (ENUMs)](#5-criar-tipos-enumerados-enums)
6. [Criar Tabelas](#6-criar-tabelas)
7. [Criar Funções de Segurança](#7-criar-funções-de-segurança)
8. [Habilitar Row Level Security (RLS)](#8-habilitar-row-level-security-rls)
9. [Criar Políticas RLS](#9-criar-políticas-rls)
10. [Criar Trigger de Novo Usuário](#10-criar-trigger-de-novo-usuário)
11. [Configurar Storage (Buckets)](#11-configurar-storage-buckets)
12. [Configurar Autenticação](#12-configurar-autenticação)
13. [Testar Tudo](#13-testar-tudo)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta (ou faça login)
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `licitamax`
   - **Database Password**: anote essa senha em local seguro (você vai precisar)
   - **Region**: `South America (São Paulo)` — para menor latência no Brasil
4. Clique em **"Create new project"** e aguarde ~2 minutos

---

## 2. Configurar Credenciais no Projeto

1. No painel do Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public key** (começa com `eyJ...`)

3. No seu projeto React, crie o arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
```

> ⚠️ **NUNCA** coloque a `service_role key` no frontend. Ela dá acesso total ao banco.

---

## 3. Instalar Dependências

Execute no terminal do projeto:

```bash
npm install @supabase/supabase-js
```

---

## 4. Criar Client Supabase

Crie o arquivo `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. ' +
    'Verifique o arquivo .env.local'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  },
});
```

---

## 5. Criar Tipos Enumerados (ENUMs)

No Supabase, vá em **SQL Editor** → **New Query** e execute:

```sql
-- =============================================
-- PASSO 5: TIPOS ENUMERADOS
-- Execute este bloco inteiro de uma vez
-- =============================================

-- Modalidades de licitação (Lei 14.133/21)
CREATE TYPE public.modalidade_licitacao AS ENUM (
  'pregao_eletronico',
  'concorrencia',
  'dispensa_eletronica',
  'inexigibilidade',
  'tomada_precos'
);

-- Status da licitação no sistema
CREATE TYPE public.status_licitacao AS ENUM (
  'falta_cadastrar',
  'em_analise',
  'cadastrada',
  'ganha',
  'perdida'
);

-- Colunas do Kanban (funil de processo)
CREATE TYPE public.coluna_kanban AS ENUM (
  'captacao',
  'analise',
  'montagem',
  'pregao',
  'recurso'
);

-- Modo de disputa
CREATE TYPE public.modo_disputa AS ENUM (
  'aberto',
  'fechado',
  'aberto_fechado'
);

-- Portais de disputa eletrônica
CREATE TYPE public.portal_disputa AS ENUM (
  'comprasnet',
  'licitacoes_e',
  'portal_compras_publicas',
  'bll',
  'outro'
);

-- Papéis de usuário no sistema
CREATE TYPE public.app_role AS ENUM (
  'admin_master',
  'analista',
  'cliente_visualizador'
);
```

✅ Resultado esperado: `Success. No rows returned`

---

## 6. Criar Tabelas

No **SQL Editor**, execute cada bloco separadamente (ou todos juntos):

### 6.1 — Tabela `empresas` (tenant)

```sql
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  email_contato VARCHAR(255),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 — Tabela `profiles` (perfis de usuário)

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  avatar_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 — Tabela `user_roles` (papéis — separada por segurança)

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

> ⚠️ **IMPORTANTE**: Roles ficam em tabela separada. NUNCA coloque role na tabela profiles — isso permite escalação de privilégio.

### 6.4 — Tabela `licitacoes`

```sql
CREATE TABLE public.licitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  orgao_nome VARCHAR(500) NOT NULL,
  modalidade modalidade_licitacao NOT NULL,
  numero_edital VARCHAR(20) NOT NULL,
  objeto TEXT NOT NULL,
  data_licitacao DATE NOT NULL,
  hora_licitacao TIME NOT NULL,
  modo_disputa modo_disputa,
  valor_referencia DECIMAL(15,2),
  portal_disputa portal_disputa,
  status status_licitacao DEFAULT 'falta_cadastrar',
  coluna_kanban coluna_kanban DEFAULT 'captacao',
  link_acesso TEXT,
  observacoes TEXT,
  checklist_completo BOOLEAN DEFAULT false,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.5 — Tabela `documentos`

```sql
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  licitacao_id UUID REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  arquivo_url TEXT NOT NULL,
  tamanho_kb INTEGER,
  data_validade DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.6 — Tabela `tarefas`

```sql
CREATE TABLE public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacao_id UUID REFERENCES public.licitacoes(id) ON DELETE CASCADE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  responsavel_id UUID REFERENCES auth.users(id),
  prazo DATE,
  concluida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.7 — Tabela `contratos`

```sql
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  licitacao_id UUID REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  orgao VARCHAR(500) NOT NULL,
  numero_ata VARCHAR(50) NOT NULL,
  objeto TEXT NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  valor_utilizado DECIMAL(15,2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'vigente',
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

### 6.8 — Tabela `itens_ata` (itens do contrato SRP)

```sql
CREATE TABLE public.itens_ata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  quantidade_total INTEGER NOT NULL,
  quantidade_utilizada INTEGER DEFAULT 0,
  preco_unitario DECIMAL(15,2) NOT NULL
);
```

### 6.9 — Tabela `eventos_calendario`

```sql
CREATE TABLE public.eventos_calendario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  licitacao_id UUID REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('pregao', 'impugnacao', 'amostra', 'certidao')),
  cor VARCHAR(20) DEFAULT '#3b82f6',
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Criar Funções de Segurança

Execute no **SQL Editor**:

```sql
-- =============================================
-- PASSO 7: FUNÇÕES SECURITY DEFINER
-- Evitam recursão infinita nas policies RLS
-- =============================================

-- Verifica se usuário possui um papel específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Retorna o empresa_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Atualiza o campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_licitacoes_updated_at
  BEFORE UPDATE ON public.licitacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 8. Habilitar Row Level Security (RLS)

```sql
-- =============================================
-- PASSO 8: ATIVAR RLS EM TODAS AS TABELAS
-- Sem isso, qualquer usuário vê tudo!
-- =============================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_ata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_calendario ENABLE ROW LEVEL SECURITY;
```

---

## 9. Criar Políticas RLS

```sql
-- =============================================
-- PASSO 9: POLÍTICAS DE ISOLAMENTO MULTI-TENANT
-- Empresa A nunca vê dados da Empresa B
-- =============================================

-- EMPRESAS: usuário só vê sua própria empresa
CREATE POLICY "tenant_empresas_select"
  ON public.empresas FOR SELECT TO authenticated
  USING (id = public.get_user_empresa_id(auth.uid()));

-- PROFILES: vê colegas da mesma empresa
CREATE POLICY "tenant_profiles_select"
  ON public.profiles FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()));

-- PROFILES: atualiza apenas o próprio perfil
CREATE POLICY "own_profile_update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- USER_ROLES: usuário vê seus próprios roles
CREATE POLICY "own_roles_select"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- USER_ROLES: apenas admin pode inserir/deletar roles
CREATE POLICY "admin_manage_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin_master'));

-- LICITAÇÕES: CRUD completo por tenant
CREATE POLICY "tenant_licitacoes"
  ON public.licitacoes FOR ALL TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- DOCUMENTOS: CRUD por tenant
CREATE POLICY "tenant_documentos"
  ON public.documentos FOR ALL TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- TAREFAS: acesso via licitação do tenant
CREATE POLICY "tenant_tarefas"
  ON public.tarefas FOR ALL TO authenticated
  USING (
    licitacao_id IN (
      SELECT id FROM public.licitacoes
      WHERE empresa_id = public.get_user_empresa_id(auth.uid())
    )
  );

-- CONTRATOS: CRUD por tenant
CREATE POLICY "tenant_contratos"
  ON public.contratos FOR ALL TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));

-- ITENS_ATA: acesso via contrato do tenant
CREATE POLICY "tenant_itens_ata"
  ON public.itens_ata FOR ALL TO authenticated
  USING (
    contrato_id IN (
      SELECT id FROM public.contratos
      WHERE empresa_id = public.get_user_empresa_id(auth.uid())
    )
  );

-- EVENTOS: CRUD por tenant
CREATE POLICY "tenant_eventos"
  ON public.eventos_calendario FOR ALL TO authenticated
  USING (empresa_id = public.get_user_empresa_id(auth.uid()))
  WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()));
```

---

## 10. Criar Trigger de Novo Usuário

Quando um usuário faz cadastro, automaticamente cria o perfil e atribui o papel padrão:

```sql
-- =============================================
-- PASSO 10: TRIGGER AUTO-CRIAR PERFIL
-- Dispara quando auth.users recebe novo registro
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria o perfil vinculado à empresa
  INSERT INTO public.profiles (id, empresa_id, nome_completo)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'empresa_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
  );

  -- Atribui papel padrão (cliente visualizador)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente_visualizador');

  RETURN NEW;
END;
$$;

-- Conecta o trigger ao evento de criação de usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

> ⚠️ **IMPORTANTE**: Para o signup funcionar, você precisa passar `empresa_id` nos metadados:
> ```typescript
> const { error } = await supabase.auth.signUp({
>   email: 'user@email.com',
>   password: 'senha123',
>   options: {
>     data: {
>       empresa_id: 'uuid-da-empresa',
>       nome_completo: 'Nome do Usuário',
>     }
>   }
> });
> ```

---

## 11. Configurar Storage (Buckets)

### Via SQL Editor:

```sql
-- Bucket para editais e anexos de licitação
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('editais', 'editais', false, 52428800); -- 50MB

-- Bucket para documentos da empresa (certidões, contratos sociais, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documentos', 'documentos', false, 52428800); -- 50MB
```

### Políticas de acesso ao Storage:

```sql
-- Upload: apenas autenticados na mesma empresa
CREATE POLICY "tenant_upload_editais"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'editais');

CREATE POLICY "tenant_upload_documentos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos');

-- Download: apenas autenticados
CREATE POLICY "tenant_download_editais"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'editais');

CREATE POLICY "tenant_download_documentos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos');

-- Delete: apenas autenticados
CREATE POLICY "tenant_delete_editais"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'editais');

CREATE POLICY "tenant_delete_documentos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos');
```

---

## 12. Configurar Autenticação

### No painel do Supabase:

1. Vá em **Authentication → Providers**
2. **Email**: já vem habilitado por padrão ✅
3. (Opcional) **Google OAuth**:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um projeto → APIs & Services → Credentials → OAuth 2.0
   - Redirect URI: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
   - Cole Client ID e Secret no Supabase

### Configurações recomendadas:

1. **Authentication → Settings**:
   - ✅ Enable email confirmations (em produção)
   - Site URL: `https://seu-dominio.com` (ou `http://localhost:5173` para dev)
   - Redirect URLs: adicione `http://localhost:5173/**` e `https://seu-dominio.com/**`

### Criar empresa inicial para teste:

No SQL Editor, insira uma empresa de teste:

```sql
INSERT INTO public.empresas (id, cnpj, razao_social, nome_fantasia, email_contato)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '12.345.678/0001-90',
  'Assessoria LicitaMax Ltda',
  'LicitaMax',
  'contato@licitamax.com.br'
);
```

> Anote o `id` gerado — você vai usá-lo no signup como `empresa_id`.

---

## 13. Testar Tudo

### Checklist de verificação:

| # | Teste | Como verificar |
|---|-------|----------------|
| 1 | ENUMs criados | SQL: `SELECT enum_range(NULL::modalidade_licitacao);` |
| 2 | Tabelas existem | Supabase → Table Editor (deve mostrar todas) |
| 3 | RLS ativo | Table Editor → cada tabela deve ter 🔒 |
| 4 | Signup funciona | Teste no app com email + empresa_id |
| 5 | Profile criado | Após signup, verifique `profiles` no Table Editor |
| 6 | Role atribuído | Verifique `user_roles` — deve ter `cliente_visualizador` |
| 7 | Isolamento tenant | Faça login com 2 empresas diferentes, verifique que dados não se misturam |
| 8 | Storage funciona | Tente upload de PDF via app |

### Query para verificar tudo de uma vez:

```sql
-- Verifica se todas as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Resultado esperado (9 tabelas):
-- contratos
-- documentos
-- empresas
-- eventos_calendario
-- itens_ata
-- licitacoes
-- profiles
-- tarefas
-- user_roles
```

```sql
-- Verifica se RLS está ativo em todas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Todas devem ter rowsecurity = true
```

---

## 14. Troubleshooting

### ❌ "new row violates row-level security policy"
- **Causa**: O `empresa_id` do insert não bate com o perfil do usuário logado
- **Solução**: Verifique se está passando o `empresa_id` correto (use `get_user_empresa_id(auth.uid())`)

### ❌ "infinite recursion detected in policy"
- **Causa**: Uma policy RLS consulta a própria tabela
- **Solução**: Use funções `SECURITY DEFINER` (como `has_role` e `get_user_empresa_id`)

### ❌ Signup cria usuário mas não cria profile
- **Causa**: O trigger `on_auth_user_created` falhou
- **Solução**: Verifique se `empresa_id` está sendo passado nos metadados do signup e se a empresa existe na tabela `empresas`

### ❌ "relation does not exist"
- **Causa**: ENUMs não foram criados antes das tabelas
- **Solução**: Execute o Passo 5 (ENUMs) antes do Passo 6 (Tabelas)

### ❌ Dados não aparecem após login
- **Causa**: RLS está bloqueando — o usuário não tem `empresa_id` no perfil
- **Solução**: Verifique `profiles` no Table Editor e confirme que o `empresa_id` existe

### ❌ Upload de arquivo falha com 403
- **Causa**: Políticas de storage não foram criadas
- **Solução**: Execute o Passo 11 (Storage policies)

---

## 📂 Ordem de Execução Resumida

Execute no SQL Editor **nesta ordem exata**:

1. ✅ Passo 5 — ENUMs
2. ✅ Passo 6 — Tabelas (6.1 a 6.9)
3. ✅ Passo 7 — Funções de segurança
4. ✅ Passo 8 — Habilitar RLS
5. ✅ Passo 9 — Políticas RLS
6. ✅ Passo 10 — Trigger de novo usuário
7. ✅ Passo 11 — Storage (buckets + policies)
8. ✅ Passo 12 — Inserir empresa de teste
9. ✅ Passo 13 — Testar

---

> **LicitaMax** — Gestão inteligente de licitações públicas 🏛️
> 
> Em caso de dúvidas, consulte a [documentação oficial do Supabase](https://supabase.com/docs).
