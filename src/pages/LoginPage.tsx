import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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

  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Gavel className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Recuperar senha</CardTitle>
            <CardDescription>Informe seu e-mail para receber o link de redefinição</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link de recuperação
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Voltar ao login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Gavel className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">ConsultPrimer</CardTitle>
          <CardDescription>
            {view === 'signup' ? 'Crie sua conta para começar' : 'Faça login para acessar o sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {view === 'signup' ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>
          {view === 'login' && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {view === 'signup' ? 'Já tem uma conta?' : 'Não tem conta?'}{' '}
            <button
              type="button"
              onClick={() => setView(view === 'signup' ? 'login' : 'signup')}
              className="text-primary hover:underline font-medium"
            >
              {view === 'signup' ? 'Fazer login' : 'Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
