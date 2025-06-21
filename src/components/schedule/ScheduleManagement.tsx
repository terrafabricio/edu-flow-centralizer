
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, BookOpen, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
  class: string;
  teacher: string;
  room: string;
}

interface ScheduleManagementProps {
  userRole: string;
  userId: string;
}

const ScheduleManagement = ({ userRole, userId }: ScheduleManagementProps) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedule();
  }, [userRole, userId]);

  const fetchSchedule = async () => {
    try {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          class:classes(name),
          subject:subjects(name),
          teacher:profiles!schedules_teacher_id_fkey(full_name)
        `);

      // Filtrar por professor se for um professor
      if (userRole === 'professor') {
        query = query.eq('teacher_id', userId);
      }

      const { data: scheduleData, error } = await query.order('day_of_week').order('start_time');

      if (error) throw error;

      const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
      
      const formattedSchedule = scheduleData?.map(item => ({
        id: item.id,
        day: dayNames[item.day_of_week - 1],
        time: `${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`,
        subject: item.subject.name,
        class: userRole === 'aluno' ? 'Minha Turma' : item.class.name,
        teacher: userRole === 'professor' ? 'Eu' : item.teacher.full_name,
        room: `Sala ${Math.floor(Math.random() * 300) + 100}` // Simulado
      })) || [];

      setSchedule(formattedSchedule);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const groupScheduleByDay = () => {
    const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    return days.map(day => ({
      day,
      classes: schedule.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time))
    }));
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
    const dayMap: { [key: string]: string } = {
      'segunda-feira': 'Segunda-feira',
      'terça-feira': 'Terça-feira',
      'quarta-feira': 'Quarta-feira',
      'quinta-feira': 'Quinta-feira',
      'sexta-feira': 'Sexta-feira'
    };
    
    const currentDay = dayMap[today.toLowerCase()];
    return schedule.filter(item => item.day === currentDay);
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemática': 'bg-blue-100 text-blue-800',
      'Português': 'bg-green-100 text-green-800',
      'História': 'bg-yellow-100 text-yellow-800',
      'Geografia': 'bg-purple-100 text-purple-800',
      'Ciências': 'bg-red-100 text-red-800',
      'Inglês': 'bg-indigo-100 text-indigo-800'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando horários...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'aluno' ? 'Meus Horários' : 'Gestão de Horários'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'aluno' 
            ? 'Consulte seus horários de aula'
            : 'Visualize e organize os horários das turmas'
          }
        </p>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="week">Semana Completa</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Aulas de Hoje</span>
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTodaySchedule().map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.time}</span>
                      </div>
                      <Badge className={getSubjectColor(item.subject)}>
                        {item.subject}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{item.room}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.class}</p>
                      <p className="text-sm text-muted-foreground">{item.teacher}</p>
                    </div>
                  </div>
                ))}

                {getTodaySchedule().length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Não há aulas hoje</h3>
                    <p className="text-muted-foreground">
                      Aproveite para estudar ou descansar!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid gap-4">
            {groupScheduleByDay().map((dayData) => (
              <Card key={dayData.day}>
                <CardHeader>
                  <CardTitle className="text-lg">{dayData.day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dayData.classes.length > 0 ? (
                    <div className="space-y-2">
                      {dayData.classes.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium min-w-[80px]">{item.time}</span>
                            <Badge variant="outline" className={getSubjectColor(item.subject)}>
                              {item.subject}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{item.room}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{item.class}</p>
                            <p className="text-muted-foreground">{item.teacher}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Não há aulas neste dia
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedule.length}</div>
                <p className="text-xs text-muted-foreground">
                  Aulas na semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
                <Badge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(schedule.map(item => item.subject)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Matérias diferentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carga Horária</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedule.length * 50}min</div>
                <p className="text-xs text-muted-foreground">
                  Por semana
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  schedule.reduce((acc: { [key: string]: number }, item) => {
                    acc[item.subject] = (acc[item.subject] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([subject, count]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getSubjectColor(subject)}>
                        {subject}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{count} aula{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleManagement;
