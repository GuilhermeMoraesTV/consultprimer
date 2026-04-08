import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MODALIDADE_LABELS, PORTAL_LABELS, MODO_DISPUTA_LABELS, COLUNA_LABELS, ModalidadeLicitacao, PortalDisputa, ModoDisputa, ColunaKanban } from '@/types/licitacao';
import { ORGAOS_SUGESTAO } from '@/data/mockData';
import { Sparkles, Building2, FileText, Calendar, DollarSign, Globe, LinkIcon, MessageSquare, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NovaLicitacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (dados: any) => Promise<any>;
}

export function NovaLicitacaoModal({ open, onOpenChange, onSalvar }: NovaLicitacaoModalProps) {
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    orgaoComprador: '',
    modalidade: '' as ModalidadeLicitacao | '',
    numeroEdital: '',
    objeto: '',
    dataLicitacao: '',
    horaLicitacao: '09:00',
    modoDisputa: '' as ModoDisputa | '',
    valorReferencia: '',
    portalDisputa: '' as PortalDisputa | '',
    linkAcesso: '',
    observacoes: '',
    colunaKanban: 'captacao' as ColunaKanban,
  });
  const [orgaoSugestoes, setOrgaoSugestoes] = useState<string[]>([]);
  const [showSugestoes, setShowSugestoes] = useState(false);

  const handleOrgaoChange = (val: string) => {
    setForm(prev => ({ ...prev, orgaoComprador: val }));
    if (val.length >= 2) {
      const filtered = ORGAOS_SUGESTAO.filter(o => o.toLowerCase().includes(val.toLowerCase()));
      setOrgaoSugestoes(filtered);
      setShowSugestoes(filtered.length > 0);
    } else {
      setShowSugestoes(false);
    }
  };

  const resetForm = () => {
    setForm({
      orgaoComprador: '', modalidade: '', numeroEdital: '', objeto: '',
      dataLicitacao: '', horaLicitacao: '09:00', modoDisputa: '',
      valorReferencia: '', portalDisputa: '', linkAcesso: '', observacoes: '',
      colunaKanban: 'captacao' as ColunaKanban,
    });
    setStep(1);
  };

  const handleSalvar = async () => {
    if (!form.orgaoComprador || !form.modalidade || !form.numeroEdital || !form.objeto || !form.dataLicitacao) return;
    setSaving(true);
    const result = await onSalvar({
      ...form,
      valorReferencia: form.valorReferencia ? parseFloat(form.valorReferencia.replace(/[^\d,]/g, '').replace(',', '.')) : undefined,
      modoDisputa: form.modoDisputa || undefined,
      portalDisputa: form.portalDisputa || undefined,
    });
    setSaving(false);
    if (result) {
      resetForm();
      onOpenChange(false);
    }
  };

  const canNext = step === 1 
    ? !!(form.orgaoComprador && form.modalidade && form.numeroEdital && form.objeto) 
    : true;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Nova Licitação
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-sm">
              {step === 1 ? 'Informações principais' : 'Detalhes e configurações'}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={cn(
                'h-1 flex-1 rounded-full transition-all',
                s <= step ? 'bg-primary-foreground' : 'bg-primary-foreground/30'
              )} />
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              {/* Órgão Comprador */}
              <div className="space-y-2 relative">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" /> Órgão Comprador *
                </Label>
                <Input
                  value={form.orgaoComprador}
                  onChange={(e) => handleOrgaoChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSugestoes(false), 200)}
                  placeholder="Ex: Prefeitura Municipal de São Paulo"
                />
                {showSugestoes && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {orgaoSugestoes.map(o => (
                      <button
                        key={o}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onMouseDown={() => {
                          setForm(prev => ({ ...prev, orgaoComprador: o }));
                          setShowSugestoes(false);
                        }}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modalidade + Nº Edital */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" /> Modalidade *
                  </Label>
                  <Select value={form.modalidade} onValueChange={(v) => setForm(prev => ({ ...prev, modalidade: v as ModalidadeLicitacao }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODALIDADE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nº Edital *
                  </Label>
                  <Input
                    value={form.numeroEdital}
                    onChange={(e) => setForm(prev => ({ ...prev, numeroEdital: e.target.value }))}
                    placeholder="Ex: 045/2026"
                  />
                </div>
              </div>

              {/* Objeto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MessageSquare className="w-3.5 h-3.5" /> Objeto *
                </Label>
                <Textarea
                  value={form.objeto}
                  onChange={(e) => setForm(prev => ({ ...prev, objeto: e.target.value }))}
                  placeholder="Descreva o objeto da licitação..."
                  rows={3}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Data + Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Data *
                  </Label>
                  <Input
                    type="date"
                    value={form.dataLicitacao}
                    onChange={(e) => setForm(prev => ({ ...prev, dataLicitacao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hora</Label>
                  <Input
                    type="time"
                    value={form.horaLicitacao}
                    onChange={(e) => setForm(prev => ({ ...prev, horaLicitacao: e.target.value }))}
                  />
                </div>
              </div>

              {/* Valor + Modo Disputa */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5" /> Valor Referência
                  </Label>
                  <Input
                    value={form.valorReferencia}
                    onChange={(e) => setForm(prev => ({ ...prev, valorReferencia: e.target.value }))}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modo Disputa</Label>
                  <Select value={form.modoDisputa} onValueChange={(v) => setForm(prev => ({ ...prev, modoDisputa: v as ModoDisputa }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MODO_DISPUTA_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Portal + Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Globe className="w-3.5 h-3.5" /> Portal
                  </Label>
                  <Select value={form.portalDisputa} onValueChange={(v) => setForm(prev => ({ ...prev, portalDisputa: v as PortalDisputa }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PORTAL_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <LinkIcon className="w-3.5 h-3.5" /> Link de Acesso
                  </Label>
                  <Input
                    value={form.linkAcesso}
                    onChange={(e) => setForm(prev => ({ ...prev, linkAcesso: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Notas internas sobre esta licitação..."
                  rows={2}
                />
              </div>

              {/* Coluna Kanban */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Columns className="w-3.5 h-3.5" /> Etapa no Kanban
                </Label>
                <Select value={form.colunaKanban} onValueChange={(v) => setForm(prev => ({ ...prev, colunaKanban: v as ColunaKanban }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLUNA_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Se não selecionado, será atribuída à coluna "Captação"</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-between bg-muted/30">
          {step === 2 ? (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={handleSalvar} disabled={saving || !form.dataLicitacao} className="gap-1.5">
                {saving ? 'Salvando...' : '✨ Criar Licitação'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => setStep(2)} disabled={!canNext}>
                Próximo →
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
