import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, Package, Save, Upload, Trash2, Plus, Pencil, Search, Image,
  FileSignature, Eye, Loader2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

// ======== EMPRESA TAB ========

interface EmpresaForm {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  telefone: string;
  email_contato: string;
  banco: string;
  agencia: string;
  conta: string;
  chave_pix: string;
  regime_tributario: string;
  socio_responsavel: string;
  logo_url: string;
}

const EMPTY_EMPRESA: EmpresaForm = {
  razao_social: '', nome_fantasia: '', cnpj: '',
  inscricao_estadual: '', inscricao_municipal: '',
  endereco_rua: '', endereco_numero: '', endereco_bairro: '',
  endereco_cidade: '', endereco_estado: '', endereco_cep: '',
  telefone: '', email_contato: '',
  banco: '', agencia: '', conta: '', chave_pix: '',
  regime_tributario: '', socio_responsavel: '', logo_url: '',
};

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function EmpresaTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { upload, uploading } = useFileUpload('documentos');
  const [form, setForm] = useState<EmpresaForm>(EMPTY_EMPRESA);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: empId } = await supabase.rpc('get_user_empresa_id', { _user_id: user.id });
      if (empId) {
        setEmpresaId(empId);
        const { data } = await supabase.from('empresas').select('*').eq('id', empId).single();
        if (data) {
          setForm({
            razao_social: data.razao_social || '',
            nome_fantasia: data.nome_fantasia || '',
            cnpj: data.cnpj || '',
            inscricao_estadual: (data as any).inscricao_estadual || '',
            inscricao_municipal: (data as any).inscricao_municipal || '',
            endereco_rua: (data as any).endereco_rua || '',
            endereco_numero: (data as any).endereco_numero || '',
            endereco_bairro: (data as any).endereco_bairro || '',
            endereco_cidade: (data as any).endereco_cidade || '',
            endereco_estado: (data as any).endereco_estado || '',
            endereco_cep: (data as any).endereco_cep || '',
            telefone: data.telefone || '',
            email_contato: data.email_contato || '',
            banco: (data as any).banco || '',
            agencia: (data as any).agencia || '',
            conta: (data as any).conta || '',
            chave_pix: (data as any).chave_pix || '',
            regime_tributario: (data as any).regime_tributario || '',
            socio_responsavel: (data as any).socio_responsavel || '',
            logo_url: (data as any).logo_url || '',
          });
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!form.razao_social || !form.cnpj) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha Razão Social e CNPJ.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (empresaId) {
      const { error } = await supabase.from('empresas').update(form as any).eq('id', empresaId);
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Salvo!', description: 'Dados da empresa atualizados.' });
      }
    } else {
      toast({ title: 'Sem empresa', description: 'Nenhuma empresa vinculada ao seu perfil. Contate o administrador.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Use PNG ou SVG.', variant: 'destructive' });
      return;
    }
    const result = await upload(file, 'logos');
    if (result) {
      setForm(prev => ({ ...prev, logo_url: result.url }));
    }
  };

  const set = (field: keyof EmpresaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dados da Empresa</h2>
          <p className="text-sm text-muted-foreground">Informações utilizadas em propostas e documentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="gap-1.5">
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Image className="w-4 h-4" /> Logo da Empresa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {form.logo_url ? (
              <div className="relative group">
                <img src={form.logo_url} alt="Logo" className="w-full h-32 object-contain rounded-lg border border-border bg-background p-2" />
                <button onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))} className="absolute top-1 right-1 p-1 rounded bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">PNG ou SVG</span>
                <input type="file" accept=".png,.svg" onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Dados Gerais */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Dados Gerais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Razão Social *</Label>
              <Input value={form.razao_social} onChange={set('razao_social')} placeholder="Razão Social completa" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome Fantasia</Label>
              <Input value={form.nome_fantasia} onChange={set('nome_fantasia')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CNPJ *</Label>
              <Input value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Inscrição Estadual</Label>
              <Input value={form.inscricao_estadual} onChange={set('inscricao_estadual')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Inscrição Municipal</Label>
              <Input value={form.inscricao_municipal} onChange={set('inscricao_municipal')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Regime Tributário</Label>
              <Select value={form.regime_tributario} onValueChange={v => setForm(p => ({ ...p, regime_tributario: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                  <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Sócio Responsável</Label>
              <Input value={form.socio_responsavel} onChange={set('socio_responsavel')} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endereço */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">📍 Endereço</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Rua</Label>
              <Input value={form.endereco_rua} onChange={set('endereco_rua')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Número</Label>
              <Input value={form.endereco_numero} onChange={set('endereco_numero')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bairro</Label>
              <Input value={form.endereco_bairro} onChange={set('endereco_bairro')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Input value={form.endereco_cidade} onChange={set('endereco_cidade')} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={form.endereco_estado} onValueChange={v => setForm(p => ({ ...p, endereco_estado: v }))}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>{ESTADOS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CEP</Label>
              <Input value={form.endereco_cep} onChange={set('endereco_cep')} placeholder="00000-000" />
            </div>
          </CardContent>
        </Card>

        {/* Contato + Bancários */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">📞 Contato</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <Input value={form.telefone} onChange={set('telefone')} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <Input value={form.email_contato} onChange={set('email_contato')} type="email" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">🏦 Dados Bancários</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Banco</Label>
                <Input value={form.banco} onChange={set('banco')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Agência</Label>
                <Input value={form.agencia} onChange={set('agencia')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Conta</Label>
                <Input value={form.conta} onChange={set('conta')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Chave PIX</Label>
                <Input value={form.chave_pix} onChange={set('chave_pix')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Preview — Cabeçalho de Proposta</DialogTitle></DialogHeader>
          <div className="border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-4">
              {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-14 object-contain" />}
              <div>
                <p className="font-bold text-foreground">{form.razao_social || 'Razão Social'}</p>
                <p className="text-xs text-muted-foreground">CNPJ: {form.cnpj || '00.000.000/0000-00'}</p>
                {form.endereco_rua && (
                  <p className="text-xs text-muted-foreground">
                    {form.endereco_rua}, {form.endereco_numero} - {form.endereco_bairro}, {form.endereco_cidade}/{form.endereco_estado} - CEP {form.endereco_cep}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{form.telefone} | {form.email_contato}</p>
              </div>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
          </div>
          <div className="border border-border rounded-lg p-6 mt-2">
            <p className="text-xs text-muted-foreground mb-2">Bloco de Assinatura</p>
            <div className="border-t border-border pt-3 text-center">
              <p className="text-sm font-semibold text-foreground">{form.socio_responsavel || 'Nome do Responsável'}</p>
              <p className="text-xs text-muted-foreground">{form.razao_social}</p>
              <p className="text-xs text-muted-foreground">CNPJ: {form.cnpj}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======== PRODUTOS TAB ========

interface Produto {
  id: string;
  codigo_sku: string;
  descricao: string;
  marca: string;
  unidade_medida: string;
  custo_padrao: number;
  margem_lucro: number;
  ncm_codigo: string;
  ativo: boolean;
}

const EMPTY_PRODUTO: Omit<Produto, 'id'> = {
  codigo_sku: '', descricao: '', marca: '', unidade_medida: 'UN',
  custo_padrao: 0, margem_lucro: 0, ncm_codigo: '', ativo: true,
};

function ProdutosTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUTO);
  const [saving, setSaving] = useState(false);

  const fetchProdutos = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('produtos' as any).select('*').order('criado_em', { ascending: false });
    setProdutos((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProdutos(); }, [user]);

  const openNew = () => { setEditando(null); setForm(EMPTY_PRODUTO); setModalOpen(true); };
  const openEdit = (p: Produto) => {
    setEditando(p);
    setForm({ codigo_sku: p.codigo_sku, descricao: p.descricao, marca: p.marca, unidade_medida: p.unidade_medida, custo_padrao: p.custo_padrao, margem_lucro: p.margem_lucro, ncm_codigo: p.ncm_codigo, ativo: p.ativo });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.codigo_sku || !form.descricao) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha SKU e Descrição.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (editando) {
      const { error } = await supabase.from('produtos' as any).update(form as any).eq('id', editando.id);
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Atualizado!' });
    } else {
      const { data: empId } = await supabase.rpc('get_user_empresa_id', { _user_id: user!.id });
      if (!empId) { toast({ title: 'Erro', description: 'Empresa não encontrada.', variant: 'destructive' }); setSaving(false); return; }
      const { error } = await supabase.from('produtos' as any).insert({ ...form, empresa_id: empId } as any);
      if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      else toast({ title: 'Produto criado!' });
    }
    setSaving(false);
    setModalOpen(false);
    fetchProdutos();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('produtos' as any).delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Removido!' }); fetchProdutos(); }
  };

  const filtrados = produtos.filter(p =>
    !busca || p.descricao.toLowerCase().includes(busca.toLowerCase()) || p.codigo_sku.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Catálogo de Produtos/Serviços</h2>
          <p className="text-sm text-muted-foreground">{produtos.length} itens cadastrados</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="w-4 h-4" /> Novo Item</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por SKU ou descrição..." className="pl-9" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">SKU</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Descrição</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Marca</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Un.</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Custo</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Margem</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-sm text-muted-foreground">Nenhum produto cadastrado</td></tr>
              ) : filtrados.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-foreground">{p.codigo_sku}</td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">{p.descricao}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.marca || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.unidade_medida}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">R$ {Number(p.custo_padrao).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right text-foreground">{Number(p.margem_lucro).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', p.ativo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editando ? 'Editar Item' : 'Novo Item'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Código SKU *</Label>
                <Input value={form.codigo_sku} onChange={e => setForm(p => ({ ...p, codigo_sku: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Marca</Label>
                <Input value={form.marca} onChange={e => setForm(p => ({ ...p, marca: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Descrição *</Label>
              <Textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unidade</Label>
                <Select value={form.unidade_medida} onValueChange={v => setForm(p => ({ ...p, unidade_medida: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['UN','CX','KG','L','M','M²','M³','PCT','PAR','HR','SV'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Custo (R$)</Label>
                <Input type="number" step="0.01" value={form.custo_padrao} onChange={e => setForm(p => ({ ...p, custo_padrao: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Margem (%)</Label>
                <Input type="number" step="0.1" value={form.margem_lucro} onChange={e => setForm(p => ({ ...p, margem_lucro: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">NCM / Código Serviço</Label>
              <Input value={form.ncm_codigo} onChange={e => setForm(p => ({ ...p, ncm_codigo: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======== PAGE ========

export default function CadastrosPage() {
  return (
    <AppLayout titulo="Cadastros" subtitulo="Gerencie a empresa e o catálogo de produtos/serviços">
      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="empresa" className="gap-1.5"><Building2 className="w-4 h-4" /> Empresa</TabsTrigger>
          <TabsTrigger value="produtos" className="gap-1.5"><Package className="w-4 h-4" /> Produtos/Serviços</TabsTrigger>
        </TabsList>
        <TabsContent value="empresa"><EmpresaTab /></TabsContent>
        <TabsContent value="produtos"><ProdutosTab /></TabsContent>
      </Tabs>
    </AppLayout>
  );
}
