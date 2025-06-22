import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { School } from "lucide-react";

type UserRole = 'diretor' | 'coordenador' | 'professor' | 'aluno' | 'pai_mae';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'aluno' as UserRole
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      console.log('Login successful:', data.user?.email);
      
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            role: signupData.role
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso! Verifique seu email para confirmar."
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sistema Escolar</CardTitle>
          <CardDescription>
            Faça login ou crie uma conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Sua senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signupEmail">E-mail</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Perfil</Label>
                  <Select value={signupData.role} onValueChange={(value: UserRole) => setSignupData({...signupData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aluno">Aluno</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="pai_mae">Pai/Mãe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="signupPassword">Senha</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    placeholder="Sua senha (mín. 6 caracteres)"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
