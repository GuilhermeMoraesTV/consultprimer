import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gavel, Loader2, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setValid(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Senha atualizada com sucesso!' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite_2s]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Gavel className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">ConsultPrimer</span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 p-8">
          {!valid ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Link inválido</h2>
              <p className="text-sm text-muted-foreground">Este link de recuperação é inválido ou expirou.</p>
              <Button onClick={() => navigate('/login')} className="shadow-lg shadow-primary/20">
                Voltar ao login
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  <Sparkles className="w-3 h-3" />
                  Quase lá
                </div>
                <h2 className="text-2xl font-bold text-foreground">Nova senha</h2>
                <p className="text-sm text-muted-foreground mt-1">Digite sua nova senha abaixo</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-medium">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm" type="password" placeholder="••••••••" className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Redefinir senha
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()} ConsultPrimer. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
