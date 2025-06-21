
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Award, TrendingUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GradeData {
  id: string;
  student_name: string;
  class_name: string;
  subject: string;
  grade: number;
  assessment_type: string;
  assessment_date: string;
  observations?: string;
}

interface Subject {
  id: string;
  name: string;
  description?: string;
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(userRole === 'aluno' ? 'view' : 'manage');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    subject_id: '',
    grade: '',
    assessment_type: 'prova',
    assessment_date: new Date().toISOString().split('T')[0],
    observations: ''
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

      if (userRole === 'professor') {
        // Buscar alocações do professor
        const { data: allocations, error: allocError } = await supabase
          .from('teacher_allocations')
          .select(`
            *,
            class:classes(*),
            subject:subjects(*)
          `)
          .eq('teacher_id', userId);

        if (allocError) throw allocError;

        // Extrair turmas únicas
        const uniqueClasses = allocations?.reduce((acc: any[], curr) => {
          if (!acc.find(c => c.id === curr.class.id)) {
            acc.push(curr.class);
          }
          return acc;
        }, []) || [];
        setClasses(uniqueClasses);

        // Buscar alunos das turmas do professor
        if (uniqueClasses.length > 0) {
          const classIds = uniqueClasses.map(cls => cls.id);
          const { data: classStudents, error: studentError } = await supabase
            .from('student_classes')
            .select(`
              student_id,
              student:profiles!student_classes_student_id_fkey(id, full_name, enrollment_number)
            `)
            .in('class_id', classIds);

          if (studentError) throw studentError;
          
          const uniqueStudents = classStudents?.reduce((acc: any[], curr) => {
            if (!acc.find(s => s.id === curr.student.id)) {
              acc.push(curr.student);
            }
            return acc;
          }, []) || [];
          
          setStudents(uniqueStudents);
        }

        // Buscar notas lançadas pelo professor
        const { data: teacherGrades, error: gradesError } = await supabase
          .from('grades')
          .select(`
            *,
            student:profiles!grades_student_id_fkey(full_name),
            class:classes(name),
            subject:subjects(name)
          `)
          .eq('teacher_id', userId);

        if (gradesError) throw gradesError;

        const formattedGrades = teacherGrades?.map(grade => ({
          id: grade.id,
          student_name: grade.student.full_name,
          class_name: grade.class.name,
          subject: grade.subject.name,
          grade: grade.grade,
          assessment_type: grade.assessment_type,
          assessment_date: grade.assessment_date,
          observations: grade.observations
        })) || [];

        setGrades(formattedGrades);

      } else if (userRole === 'aluno') {
        // Buscar notas do aluno específico
        const { data: studentGrades, error: gradesError } = await supabase
          .from('grades')
          .select(`
            *,
            class:classes(name),
            subject:subjects(name)
          `)
          .eq('student_id', userId);

        if (gradesError) throw gradesError;

        const formattedGrades = studentGrades?.map(grade => ({
          id: grade.id,
          student_name: 'Minhas Notas',
          class_name: grade.class.name,
          subject: grade.subject.name,
          grade: grade.grade,
          assessment_type: grade.assessment_type,
          assessment_date: grade.assessment_date,
          observations: grade.observations
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
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          teacher_id: userId,
          grade: parseFloat(formData.grade),
          assessment_type: formData.assessment_type,
          assessment_date: formData.assessment_date,
          observations: formData.observations || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nota lançada com sucesso"
      });
      
      setFormData({
        student_id: '',
        class_id: '',
        subject_id: '',
        grade: '',
        assessment_type: 'prova',
        assessment_date: new Date().toISOString().split('T')[0],
        observations: ''
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

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 7) return 'text-blue-600';
    if (grade >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateAverage = (): number => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return sum / grades.length;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando notas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'aluno' ? 'Minhas Notas' : 'Gestão de Notas'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'aluno' 
            ? 'Acompanhe seu desempenho acadêmico'
            : 'Lance e gerencie as notas dos alunos'
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {userRole === 'professor' && (
            <>
              <TabsTrigger value="manage">Lançar Notas</TabsTrigger>
              <TabsTrigger value="view">Consultar Notas</TabsTrigger>
            </>
          )}
          {userRole === 'aluno' && (
            <>
              <TabsTrigger value="view">Minhas Notas</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
            </>
          )}
        </TabsList>

        {userRole === 'professor' && (
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
                      <Label htmlFor="class_id">Turma</Label>
                      <Select value={formData.class_id} onValueChange={(value) => setFormData({...formData, class_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="student_id">Aluno</Label>
                      <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aluno" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="subject_id">Disciplina</Label>
                      <Select value={formData.subject_id} onValueChange={(value) => setFormData({...formData, subject_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="grade">Nota</Label>
                      <Input
                        id="grade"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.grade}
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="assessment_type">Tipo de Avaliação</Label>
                      <Select value={formData.assessment_type} onValueChange={(value) => setFormData({...formData, assessment_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prova">Prova</SelectItem>
                          <SelectItem value="trabalho">Trabalho</SelectItem>
                          <SelectItem value="seminario">Seminário</SelectItem>
                          <SelectItem value="participacao">Participação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="assessment_date">Data da Avaliação</Label>
                    <Input
                      id="assessment_date"
                      type="date"
                      value={formData.assessment_date}
                      onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="observations">Observações</Label>
                    <Input
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                      placeholder="Observações opcionais"
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
                          {grade.class_name} • {grade.assessment_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grade.assessment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade.toFixed(1)}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {grade.assessment_type}
                      </Badge>
                    </div>
                  </div>
                  {grade.observations && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                      <p className="text-sm">{grade.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {grades.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma nota encontrada</h3>
                  <p className="text-muted-foreground text-center">
                    {userRole === 'aluno' 
                      ? "Suas notas aparecerão aqui quando forem lançadas pelos professores."
                      : "Comece lançando a primeira nota na aba 'Lançar Notas'."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {userRole === 'aluno' && (
          <TabsContent value="summary">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getGradeColor(calculateAverage())}`}>
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
                    {grades.length > 0 ? Math.max(...grades.map(g => g.grade)).toFixed(1) : '0.0'}
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
