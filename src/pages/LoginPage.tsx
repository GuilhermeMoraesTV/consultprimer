import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gavel, Loader2, ArrowLeft, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [view, setView] = useState<ViewMode>('login');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (view === 'signup') {
        if (!nome.trim()) {
          toast({ title: 'Informe seu nome completo', variant: 'destructive' });
          setSubmitting(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nome_completo: nome },
          },
        });
        if (error) throw error;
        toast({
          title: 'Cadastro realizado!',
          description: 'Verifique seu e-mail para confirmar a conta.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('E-mail ou senha incorretos. Verifique e tente novamente.');
          }
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Informe seu e-mail', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${base}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      });
      setView('login');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const switchView = (newView: ViewMode) => {
    setView(newView);
  };

  const title = view === 'signup' ? 'Criar conta' : view === 'forgot' ? 'Recuperar senha' : 'Bem-vindo de volta';
  const subtitle = view === 'signup'
    ? 'Preencha os dados para começar'
    : view === 'forgot'
    ? 'Informe seu e-mail para receber o link'
    : 'Faça login para acessar o sistema';

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-[pulse_7s_ease-in-out_infinite_2s]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Gavel className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">ConsultPrimer</h1>
              <p className="text-sm text-muted-foreground">Gestão de Licitações</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Gerencie suas licitações com{' '}
              <span className="text-primary">inteligência</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Controle editais, documentos, prazos e propostas em uma plataforma integrada
              e intuitiva.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { label: 'Kanban', desc: 'Fluxo visual' },
              { label: 'Documentos', desc: 'Gestão completa' },
              { label: 'Contratos', desc: 'Atas e aditivos' },
              { label: 'Analytics', desc: 'Dados em tempo real' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div
          className="w-full max-w-md animate-scale-in"
          key={view}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Gavel className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">ConsultPrimer</span>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                {view === 'signup' ? 'Novo por aqui?' : view === 'forgot' ? 'Sem problemas' : 'Área segura'}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>

            {/* Forgot password form */}
            {view === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link de recuperação
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Voltar ao login
                  </button>
                </div>
              </form>
            ) : (
              /* Login / Signup form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {view === 'signup' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="nome" className="text-sm font-medium">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary transition-colors"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {view === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {view === 'signup' ? 'Criar minha conta' : 'Entrar'}
                </Button>
              </form>
            )}

            {/* Switch view */}
            {view !== 'forgot' && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {view === 'signup' ? 'Já tem uma conta?' : 'Não tem conta?'}{' '}
                <button
                  type="button"
                  onClick={() => switchView(view === 'signup' ? 'login' : 'signup')}
                  className="text-primary hover:underline font-semibold transition-colors"
                >
                  {view === 'signup' ? 'Fazer login' : 'Cadastre-se'}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            © {new Date().getFullYear()} ConsultPrimer. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
