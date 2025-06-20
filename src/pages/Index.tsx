
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Shield,
  ChevronRight,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Gestão de Usuários",
      description: "Controle completo de professores, alunos, coordenadores e diretores",
      color: "text-blue-600"
    },
    {
      icon: School,
      title: "Administração de Turmas",
      description: "Organize turmas, disciplinas e horários de forma eficiente",
      color: "text-green-600"
    },
    {
      icon: GraduationCap,
      title: "Portal do Estudante",
      description: "Acesso a notas, horários e informações acadêmicas",
      color: "text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Gestão Acadêmica",
      description: "Controle de disciplinas, avaliações e desempenho",
      color: "text-orange-600"
    },
    {
      icon: Calendar,
      title: "Calendário Escolar",
      description: "Organização de eventos, provas e atividades",
      color: "text-red-600"
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Controle de acesso baseado em perfis e permissões",
      color: "text-indigo-600"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Diretora",
      content: "O sistema revolucionou nossa gestão escolar. Tudo ficou mais organizado e eficiente.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Professor",
      content: "Interface intuitiva que facilita muito o lançamento de notas e acompanhamento dos alunos.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Coordenadora",
      content: "Excelente ferramenta para organizar horários e acompanhar o desempenho das turmas.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <School className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Sistema Escolar</h1>
                <p className="text-xs text-muted-foreground">Gestão Educacional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            ✨ Solução Completa de Gestão Escolar
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme a Gestão da
            <span className="text-primary block">Sua Escola</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Uma plataforma moderna e intuitiva para gerenciar todos os aspectos da sua instituição educacional. 
            Simplifique processos, melhore a comunicação e potencialize resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Experimente Gratuitamente
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para uma gestão escolar eficiente e moderna
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que Escolher Nosso Sistema?
              </h2>
              <div className="space-y-4">
                {[
                  "Interface moderna e intuitiva",
                  "Controle de acesso baseado em perfis",
                  "Relatórios detalhados e analytics",
                  "Integração completa entre módulos",
                  "Suporte técnico especializado",
                  "Atualizações constantes"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-100">
                <div className="text-center">
                  <School className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Mais de 500+ Escolas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Já confiam na nossa plataforma para gerenciar suas atividades educacionais
                  </p>
                  <div className="flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">4.9/5 de satisfação</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que Nossos Usuários Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Depoimentos reais de educadores que transformaram suas escolas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Revolucionar sua Escola?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de instituições que já transformaram sua gestão educacional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <School className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Sistema Escolar</h3>
                <p className="text-sm text-gray-400">Gestão Educacional Moderna</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 Sistema Escolar. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Desenvolvido com ❤️ para a educação
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
