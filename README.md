# 🏛️ ConsultPrimer — Sistema de Gestão de Licitações

> Plataforma profissional para assessoria e gestão completa de licitações públicas, baseada na **Lei 14.133/21 (Nova Lei de Licitações)**.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Módulos do Sistema](#módulos-do-sistema)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Configuração do Supabase](#configuração-do-supabase)
6. [Design System](#design-system)
7. [Regras de Negócio](#regras-de-negócio)
8. [Roadmap](#roadmap)

---

## Visão Geral

SaaS B2B multi-tenant para **assessorias de licitações** e **empresas que disputam certames públicos**. Centraliza todo o ciclo: captação → análise → montagem → pregão → adjudicação → contrato.

### Funcionalidades Implementadas
- ✅ Dashboard com métricas financeiras e pendências
- ✅ Kanban interativo com drag & drop (@dnd-kit)
- ✅ Calendário de licitações com eventos tipados
- ✅ Design system profissional B2B com semáforo de status
- ✅ Navegação lateral com sidebar colapsável

### Em Desenvolvimento
- Cadastro completo de licitação (formulário)
- GED com upload e visualizador PDF
- Autenticação e multi-tenant
- Contratos e Atas SRP
- Analytics avançado

---

## Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | Métricas, próximas licitações, pendências |
| **Kanban** | Board 5 colunas com trava de segurança |
| **Agenda** | Calendário mensal com pregões, impugnações, certidões |
| **Licitações** | Cadastro com todos os campos do edital |
| **Documentos (GED)** | Semáforo de validade, visualizador PDF, download ZIP |
| **Contratos/SRP** | Atas de Registro de Preços, saldo de itens |
| **Analytics** | Volume disputado vs. ganho, taxa de sucesso |

---

## Stack Tecnológica

| Tecnologia | Finalidade |
|-----------|-----------|
| React 18 + TypeScript 5 | UI com tipagem rigorosa |
| Vite 5 | Bundler ultrarrápido |
| Tailwind CSS 3 + shadcn/ui | Design system |
| @dnd-kit | Drag & Drop (Kanban) |
| date-fns | Datas com locale pt-BR |
| Supabase | PostgreSQL + Auth + Storage + Edge Functions |

---

## Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/              # shadcn/ui base
│   ├── AppLayout.tsx    # Layout principal
│   ├── AppSidebar.tsx   # Navegação lateral
│   ├── KanbanCard.tsx   # Card do Kanban
│   └── StatusBadge.tsx  # Badge de status
├── data/mockData.ts     # Dados simulados
├── lib/formatters.ts    # Formatação moeda/datas
├── pages/               # Rotas do sistema
├── types/licitacao.ts   # Tipos do domínio
└── index.css            # Design system completo
```

---

## Configuração do Supabase

### 1. Criar Projeto
- [supabase.com](https://supabase.com) → New Project → Region: São Paulo

### 2. Credenciais
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Schema — SQL Editor

**Tipos Enumerados:**
```sql
CREATE TYPE public.modalidade_licitacao AS ENUM ('pregao_eletronico','concorrencia','dispensa_eletronica','inexigibilidade','tomada_precos');
CREATE TYPE public.status_licitacao AS ENUM ('falta_cadastrar','em_analise','cadastrada','ganha','perdida');
CREATE TYPE public.coluna_kanban AS ENUM ('captacao','analise','montagem','pregao','recurso');
CREATE TYPE public.modo_disputa AS ENUM ('aberto','fechado','aberto_fechado');
CREATE TYPE public.portal_disputa AS ENUM ('comprasnet','licitacoes_e','portal_compras_publicas','bll','outro');
CREATE TYPE public.app_role AS ENUM ('admin_master','analista','cliente_visualizador');
```

**Tabelas:**
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

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

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
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  licitacao_id UUID REFERENCES public.licitacoes(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  arquivo_url TEXT NOT NULL,
  data_validade DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT now()
);

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

### 4. RLS (Isolamento Multi-tenant)
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT empresa_id FROM public.profiles WHERE id = _user_id LIMIT 1 $$;

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_empresas" ON public.empresas FOR SELECT TO authenticated USING (id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "tenant_licitacoes" ON public.licitacoes FOR ALL TO authenticated USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "tenant_documentos" ON public.documentos FOR ALL TO authenticated USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "tenant_profiles" ON public.profiles FOR SELECT TO authenticated USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "own_profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
```

### 5. Storage
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('editais', 'editais', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);
```

### 6. Trigger de Perfil
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, empresa_id, nome_completo)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'empresa_id')::UUID, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cliente_visualizador');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Design System

| Token | Uso | Cor |
|-------|-----|-----|
| `--primary` | Ações principais | Azul Corporativo |
| `--status-pendente` | Alertas, vencidos | Vermelho |
| `--status-analise` | Atenção | Amarelo |
| `--status-cadastrada` | Informação | Azul |
| `--status-ganha` | Sucesso | Verde |
| `--accent` | Destaques | Dourado |

---

## Regras de Negócio

- **Lei 14.133/21**: Modalidades, modos de disputa e portais suportados
- **Trava Kanban**: Card só avança para "Dia do Pregão" com 100% dos documentos
- **Multi-tenant via RLS**: Empresa A nunca vê dados da Empresa B
- **Semáforo**: 🟢 >30 dias | 🟡 <30 dias | 🔴 Vencida

---

## Roadmap

- [x] Design System B2B
- [x] Dashboard + Kanban + Agenda
- [ ] Cadastro de licitação
- [ ] GED + Visualizador PDF
- [ ] Auth multi-tenant
- [ ] Contratos/SRP
- [ ] Analytics
- [ ] Integração ERP

---

> **ConsultPrimer** — Gestão inteligente de licitações públicas 🏛️
