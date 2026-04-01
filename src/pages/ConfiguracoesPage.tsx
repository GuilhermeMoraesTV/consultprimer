// === Página de Configurações ===
// Perfis de acesso, integrações e personalização

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import {
  Building2,
  Users,
  Plug,
  Bell,
  Shield,
  Palette,
  Mail,
  Key,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

/** Abas de configuração */
type AbaConfig = 'empresa' | 'usuarios' | 'integracoes' | 'notificacoes';

const ABAS: { id: AbaConfig; label: string; icone: typeof Building2 }[] = [
  { id: 'empresa', label: 'Empresa', icone: Building2 },
  { id: 'usuarios', label: 'Usuários e Perfis', icone: Users },
  { id: 'integracoes', label: 'Integrações', icone: Plug },
  { id: 'notificacoes', label: 'Notificações', icone: Bell },
];

/** Usuários mock */
const USUARIOS_MOCK = [
  { id: 'u1', nome: 'Carlos Silva', email: 'carlos@techsolutions.com.br', role: 'Admin Master', ativo: true },
  { id: 'u2', nome: 'Ana Oliveira', email: 'ana@techsolutions.com.br', role: 'Analista de Licitação', ativo: true },
  { id: 'u3', nome: 'Roberto Santos', email: 'roberto@techsolutions.com.br', role: 'Analista de Licitação', ativo: true },
  { id: 'u4', nome: 'Maria Costa', email: 'maria@clienteexterno.com', role: 'Cliente Visualizador', ativo: false },
];

/** Integrações mock */
const INTEGRACOES_MOCK = [
  { id: 'int1', nome: 'Bling ERP', descricao: 'Sincronização automática de vendas e notas fiscais', conectado: false, icone: '📦' },
  { id: 'int2', nome: 'Conta Azul', descricao: 'Gestão financeira integrada com contratos', conectado: false, icone: '💰' },
  { id: 'int3', nome: 'WhatsApp Business', descricao: 'Alertas de prazos e notificações para a equipe', conectado: true, icone: '💬' },
  { id: 'int4', nome: 'Google Calendar', descricao: 'Sincronizar agenda de licitações', conectado: true, icone: '📅' },
  { id: 'int5', nome: 'ComprasNet (Gov)', descricao: 'Importação automática de editais', conectado: false, icone: '🏛️' },
];

export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaConfig>('empresa');
  const { toast } = useToast();

  // Estado da empresa
  const [empresa, setEmpresa] = useState({
    razaoSocial: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    nomeFantasia: 'Tech Solutions',
    emailContato: 'contato@techsolutions.com.br',
    telefone: '(11) 99999-8888',
  });

  // Notificações
  const [notificacoes, setNotificacoes] = useState({
    emailPrazo: true,
    emailDocumento: true,
    emailResultado: true,
    pushPrazo: false,
    pushDocumento: false,
    antecedenciaDias: '3',
  });

  const handleSalvar = () => {
    toast({ title: '✅ Configurações salvas!', description: 'Todas as alterações foram aplicadas.' });
  };

  return (
    <AppLayout titulo="Configurações" subtitulo="Gerencie sua empresa, usuários e integrações">
      <div className="flex gap-6">
        {/* Sidebar de abas */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  abaAtiva === aba.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <aba.icone className="w-4 h-4" />
                {aba.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 max-w-3xl">
          {/* ABA: Empresa */}
          {abaAtiva === 'empresa' && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Dados da Empresa</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Razão Social</Label>
                    <Input
                      value={empresa.razaoSocial}
                      onChange={(e) => setEmpresa((f) => ({ ...f, razaoSocial: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">CNPJ</Label>
                    <Input value={empresa.cnpj} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Nome Fantasia</Label>
                    <Input
                      value={empresa.nomeFantasia}
                      onChange={(e) => setEmpresa((f) => ({ ...f, nomeFantasia: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Telefone</Label>
                    <Input
                      value={empresa.telefone}
                      onChange={(e) => setEmpresa((f) => ({ ...f, telefone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">E-mail de Contato</Label>
                  <Input
                    value={empresa.emailContato}
                    onChange={(e) => setEmpresa((f) => ({ ...f, emailContato: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSalvar}>Salvar Alterações</Button>
                </div>
              </div>
            </div>
          )}

          {/* ABA: Usuários */}
          {abaAtiva === 'usuarios' && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Usuários</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Convidar via Link
                    </Button>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Adicionar Usuário
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {USUARIOS_MOCK.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 py-3.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {u.nome.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{u.nome}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        u.role === 'Admin Master' ? 'bg-primary/10 text-primary' :
                        u.role === 'Analista de Licitação' ? 'bg-status-cadastrada/10 text-status-cadastrada' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {u.role}
                      </span>
                      <div className={cn(
                        'flex items-center gap-1 text-xs font-medium',
                        u.ativo ? 'text-status-ganha' : 'text-muted-foreground'
                      )}>
                        {u.ativo ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-secondary transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-secondary transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perfis de acesso */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Perfis de Acesso</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { nome: 'Admin Master', desc: 'Acesso completo a todos os módulos, usuários e configurações', icone: Key },
                    { nome: 'Analista de Licitação', desc: 'Cadastro e gestão de editais, documentos e acompanhamento de pregões', icone: Edit2 },
                    { nome: 'Cliente Visualizador', desc: 'Visualização dos editais e documentos da própria empresa, sem edição', icone: Users },
                  ].map((perfil) => (
                    <div key={perfil.nome} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <perfil.icone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{perfil.nome}</p>
                        <p className="text-xs text-muted-foreground">{perfil.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: Integrações */}
          {abaAtiva === 'integracoes' && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <Plug className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Integrações</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Conecte o LicitaMax com seus sistemas para automatizar o fluxo de trabalho.
              </p>

              <div className="space-y-3">
                {INTEGRACOES_MOCK.map((int) => (
                  <div key={int.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:shadow-sm transition-all">
                    <span className="text-2xl">{int.icone}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{int.nome}</p>
                      <p className="text-xs text-muted-foreground">{int.descricao}</p>
                    </div>
                    {int.conectado ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-ganha">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                        </span>
                        <Button variant="outline" size="sm">Configurar</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Conectar
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Webhook */}
              <div className="mt-6 p-4 rounded-xl border border-border bg-secondary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">API & Webhooks</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Use a API REST para integrar o LicitaMax com seu ERP. Webhooks disparam automaticamente ao marcar uma licitação como "Ganha".
                </p>
                <div className="flex items-center gap-2">
                  <Input value="https://api.licitamax.com/webhook/v1/emp1" disabled className="bg-muted text-xs font-mono" />
                  <Button size="sm" variant="outline">Copiar</Button>
                </div>
              </div>
            </div>
          )}

          {/* ABA: Notificações */}
          {abaAtiva === 'notificacoes' && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-5">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Preferências de Notificação</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Notificações por E-mail</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailPrazo', label: 'Prazos de licitação se aproximando', desc: 'Alerta quando a data do pregão estiver próxima' },
                      { key: 'emailDocumento', label: 'Documentos próximos de vencer', desc: 'Certidões e atestados com validade acabando' },
                      { key: 'emailResultado', label: 'Resultados de licitação', desc: 'Quando um edital for marcado como Ganha ou Perdida' },
                    ].map((notif) => (
                      <div key={notif.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div>
                          <p className="text-sm font-medium text-foreground">{notif.label}</p>
                          <p className="text-xs text-muted-foreground">{notif.desc}</p>
                        </div>
                        <Switch
                          checked={notificacoes[notif.key as keyof typeof notificacoes] as boolean}
                          onCheckedChange={(v) => setNotificacoes((n) => ({ ...n, [notif.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Antecedência dos alertas (dias)</Label>
                  <Input
                    type="number"
                    value={notificacoes.antecedenciaDias}
                    onChange={(e) => setNotificacoes((n) => ({ ...n, antecedenciaDias: e.target.value }))}
                    className="w-24 mt-1.5"
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviar alertas com {notificacoes.antecedenciaDias} dia(s) de antecedência
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSalvar}>Salvar Preferências</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
