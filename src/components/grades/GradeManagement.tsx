
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GradeData {
  id: string;
  student_name: string;
  class_name: string;
  subject: string;
  score: number;
  assessment_name: string;
  assessment_date: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  name: string;
  class_id: string;
  subject_id: string;
  date: string;
  max_score: number;
}

interface GradeManagementProps {
  userRole: string;
  userId: string;
}

const GradeManagement = ({ userRole, userId }: GradeManagementProps) => {
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(userRole === 'student' ? 'view' : 'manage');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    assessment_id: '',
    score: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, [userRole, userId]);

  const fetchInitialData = async () => {
    try {
      // Buscar disciplinas
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      if (userRole === 'teacher') {
        // Buscar turmas do professor via teacher_subjects
        const { data: teacherSubjects, error: teacherError } = await supabase
          .from('teacher_subjects')
          .select(`
            *,
            classes(*),
            subjects(*)
          `)
          .eq('teacher_id', userId);

        if (teacherError) throw teacherError;

        // Extrair turmas únicas
        const uniqueClasses = teacherSubjects?.reduce((acc: any[], curr) => {
          if (!acc.find(c => c.id === curr.classes.id)) {
            acc.push(curr.classes);
          }
          return acc;
        }, []) || [];
        setClasses(uniqueClasses);

        // Buscar alunos das turmas do professor
        if (uniqueClasses.length > 0) {
          const classIds = uniqueClasses.map(cls => cls.id);
          const { data: studentsData, error: studentError } = await supabase
            .from('students')
            .select(`
              *,
              profiles(*)
            `)
            .in('class_id', classIds);

          if (studentError) throw studentError;
          setStudents(studentsData || []);
        }

        // Buscar avaliações
        const { data: assessmentsData, error: assessError } = await supabase
          .from('assessments')
          .select('*')
          .order('date', { ascending: false });

        if (assessError) throw assessError;
        setAssessments(assessmentsData || []);

      } else if (userRole === 'student') {
        // Buscar notas do aluno específico
        const { data: studentGrades, error: gradesError } = await supabase
          .from('grades')
          .select(`
            *,
            assessments(name, date, classes(name), subjects(name))
          `)
          .eq('student_id', userId);

        if (gradesError) throw gradesError;

        const formattedGrades = studentGrades?.map(grade => ({
          id: grade.id,
          student_name: 'Minhas Notas',
          class_name: grade.assessments?.classes?.name || 'N/A',
          subject: grade.assessments?.subjects?.name || 'N/A',
          score: grade.score || 0,
          assessment_name: grade.assessments?.name || 'N/A',
          assessment_date: grade.assessments?.date || ''
        })) || [];

        setGrades(formattedGrades);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('grades')
        .insert({
          student_id: formData.student_id,
          assessment_id: formData.assessment_id,
          score: parseFloat(formData.score)
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nota lançada com sucesso"
      });
      
      setFormData({
        student_id: '',
        assessment_id: '',
        score: ''
      });

      fetchInitialData();
    } catch (error) {
      console.error('Erro ao lançar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível lançar a nota",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateAverage = (): number => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return sum / grades.length;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando notas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'student' ? 'Minhas Notas' : 'Gestão de Notas'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'student' 
            ? 'Acompanhe seu desempenho acadêmico'
            : 'Lance e gerencie as notas dos alunos'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {userRole === 'teacher' && (
            <>
              <TabsTrigger value="manage">Lançar Notas</TabsTrigger>
              <TabsTrigger value="view">Consultar Notas</TabsTrigger>
            </>
          )}
          {userRole === 'student' && (
            <>
              <TabsTrigger value="view">Minhas Notas</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
            </>
          )}
        </TabsList>

        {userRole === 'teacher' && (
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Lançar Nova Nota</CardTitle>
                <CardDescription>
                  Registre a avaliação de um aluno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_id">Aluno</Label>
                      <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aluno" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.profiles?.full_name || 'Nome não encontrado'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="assessment_id">Avaliação</Label>
                      <Select value={formData.assessment_id} onValueChange={(value) => setFormData({...formData, assessment_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a avaliação" />
                        </SelectTrigger>
                        <SelectContent>
                          {assessments.map((assessment) => (
                            <SelectItem key={assessment.id} value={assessment.id}>
                              {assessment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="score">Nota</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.score}
                      onChange={(e) => setFormData({...formData, score: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Lançar Nota
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="view">
          <div className="space-y-4">
            {grades.map((grade) => (
              <Card key={grade.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{grade.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {grade.class_name} • {grade.assessment_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grade.assessment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(grade.score)}`}>
                        {grade.score.toFixed(1)}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        Prova
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {grades.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma nota encontrada</h3>
                  <p className="text-muted-foreground text-center">
                    {userRole === 'student' 
                      ? "Suas notas aparecerão aqui quando forem lançadas pelos professores."
                      : "Comece lançando a primeira nota na aba 'Lançar Notas'."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {userRole === 'student' && (
          <TabsContent value="summary">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(calculateAverage())}`}>
                    {calculateAverage().toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Baseado em {grades.length} avaliações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maior Nota</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {grades.length > 0 ? Math.max(...grades.map(g => g.score)).toFixed(1) : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Melhor desempenho
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {grades.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avaliações realizadas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default GradeManagement;
