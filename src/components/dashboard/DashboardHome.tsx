
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  GraduationCap, 
  School, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHomeProps {
  profile: any;
}

const DashboardHome = ({ profile }: DashboardHomeProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Contar estudantes
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Contar professores
      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      // Contar turmas
      const { count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      // Contar disciplinas
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalClasses: classesCount || 0,
        totalSubjects: subjectsCount || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
    } else if (hour >= 18) {
      greeting = 'Boa noite';
    }

    return `${greeting}, ${profile?.full_name?.split(' ')[0] || 'Usuário'}!`;
  };

  const getRoleSpecificCards = () => {
    const baseCards = [
      {
        title: "Total de Estudantes",
        value: stats.totalStudents,
        icon: GraduationCap,
        description: "estudantes matriculados",
        color: "text-blue-600"
      },
      {
        title: "Total de Professores", 
        value: stats.totalTeachers,
        icon: Users,
        description: "professores cadastrados",
        color: "text-green-600"
      },
      {
        title: "Total de Turmas",
        value: stats.totalClasses,
        icon: School,
        description: "turmas ativas",
        color: "text-purple-600"
      }
    ];

    switch (profile?.role) {
      case 'admin':
        return [
          ...baseCards,
          {
            title: "Disciplinas",
            value: stats.totalSubjects,
            icon: BookOpen,
            description: "disciplinas cadastradas",
            color: "text-orange-600"
          }
        ];
      case 'coord':
        return baseCards;
      case 'teacher':
        return [
          {
            title: "Minhas Turmas",
            value: 3, // Implementar lógica específica
            icon: School,
            description: "turmas que leciono",
            color: "text-purple-600"
          },
          {
            title: "Meus Alunos",
            value: 45, // Implementar lógica específica
            icon: GraduationCap,
            description: "alunos no total",
            color: "text-blue-600"
          }
        ];
      case 'student':
        return [
          {
            title: "Minhas Disciplinas",
            value: 8, // Implementar lógica específica
            icon: BookOpen,
            description: "disciplinas cursando",
            color: "text-orange-600"
          },
          {
            title: "Média Geral",
            value: "8.5", // Implementar lógica específica
            icon: Award,
            description: "média atual",
            color: "text-green-600"
          }
        ];
      default:
        return baseCards;
    }
  };

  const getQuickActions = () => {
    switch (profile?.role) {
      case 'admin':
        return [
          { title: "Cadastrar Usuário", description: "Adicionar novo membro", action: "users" },
          { title: "Nova Turma", description: "Criar nova turma", action: "classes" },
          { title: "Relatórios", description: "Ver relatórios gerais", action: "reports" }
        ];
      case 'coord':
        return [
          { title: "Gerenciar Turmas", description: "Organizar turmas", action: "classes" },
          { title: "Cadastrar Aluno", description: "Novo estudante", action: "students" },
          { title: "Horários", description: "Organizar horários", action: "schedule" }
        ];
      case 'teacher':
        return [
          { title: "Lançar Notas", description: "Registrar avaliações", action: "grades" },
          { title: "Ver Turmas", description: "Minhas turmas", action: "classes" },
          { title: "Horários", description: "Meus horários", action: "schedule" }
        ];
      case 'student':
        return [
          { title: "Ver Notas", description: "Consultar avaliações", action: "grades" },
          { title: "Horários", description: "Meus horários", action: "schedule" },
          { title: "Disciplinas", description: "Minhas matérias", action: "subjects" }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Boas-vindas */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getWelcomeMessage()}</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {profile?.role}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getRoleSpecificCards().map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {getQuickActions().map((action, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer">
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximos Eventos/Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Próximos Eventos</span>
            </CardTitle>
            <CardDescription>
              Agenda e eventos importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reunião Pedagógica</p>
                  <p className="text-xs text-muted-foreground">Hoje às 14:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Conselho de Classe</p>
                  <p className="text-xs text-muted-foreground">Amanhã às 16:00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Avisos e lembretes importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-2 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900">Sistema atualizado</p>
                <p className="text-xs text-blue-700">Novas funcionalidades disponíveis</p>
              </div>
              {profile?.role === 'teacher' && (
                <div className="p-2 bg-yellow-50 rounded-md">
                  <p className="text-sm font-medium text-yellow-900">Lembrete</p>
                  <p className="text-xs text-yellow-700">Prazo para lançamento de notas até sexta</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
