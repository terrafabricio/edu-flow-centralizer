
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  FileText, 
  Download, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  School,
  Calendar,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportsManagementProps {
  userRole: string;
}

const ReportsManagement = ({ userRole }: ReportsManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    studentsByGrade: [],
    classDistribution: [],
    performanceData: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Buscar estatísticas gerais
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'aluno');

      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'professor');

      const { count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      // Buscar distribuição por série
      const { data: classes } = await supabase
        .from('classes')
        .select('grade');

      const gradeDistribution = classes?.reduce((acc: any, cls) => {
        const grade = cls.grade;
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {}) || {};

      const studentsByGrade = Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade,
        count
      }));

      // Dados simulados para gráficos
      const performanceData = [
        { subject: 'Matemática', average: 7.5 },
        { subject: 'Português', average: 8.2 },
        { subject: 'História', average: 7.8 },
        { subject: 'Geografia', average: 7.1 },
        { subject: 'Ciências', average: 8.0 },
        { subject: 'Inglês', average: 7.3 }
      ];

      setReportData({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        totalClasses: classesCount || 0,
        studentsByGrade,
        classDistribution: studentsByGrade,
        performanceData
      });
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos relatórios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: string) => {
    toast({
      title: "Relatório Gerado",
      description: `Relatório de ${type} foi gerado com sucesso (simulação)`,
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const canViewReports = ['diretor', 'coordenador'].includes(userRole);

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Apenas diretores e coordenadores podem acessar relatórios.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e estatísticas da escola
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Estudantes matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Professores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Turmas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">7.7</div>
            <p className="text-xs text-muted-foreground">
              Desempenho escolar
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Série</CardTitle>
                <CardDescription>
                  Número de turmas por série
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.studentsByGrade.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.studentsByGrade}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, count }) => `${grade}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reportData.studentsByGrade.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Não há dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
                <CardDescription>
                  Atividades do mês atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Novos Alunos</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Turmas Criadas</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avaliações Realizadas</span>
                  <Badge variant="secondary">45</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frequência Média</span>
                  <Badge variant="secondary">92%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>
                Média de notas por matéria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="average" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Relatório de Alunos</span>
                </CardTitle>
                <CardDescription>
                  Lista completa de estudantes matriculados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('Alunos')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Relatório de Professores</span>
                </CardTitle>
                <CardDescription>
                  Informações do corpo docente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('Professores')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5" />
                  <span>Relatório de Turmas</span>
                </CardTitle>
                <CardDescription>
                  Organização das turmas e horários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('Turmas')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Relatório de Desempenho</span>
                </CardTitle>
                <CardDescription>
                  Análise de notas e frequência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('Desempenho')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Relatório Mensal</span>
                </CardTitle>
                <CardDescription>
                  Resumo das atividades do mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <Select defaultValue="current">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Mês Atual</SelectItem>
                      <SelectItem value="previous">Mês Anterior</SelectItem>
                      <SelectItem value="custom">Período Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => generateReport('Mensal')}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Relatório Personalizado</span>
                </CardTitle>
                <CardDescription>
                  Configure seus próprios filtros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('Personalizado')}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
