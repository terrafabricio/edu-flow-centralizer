
-- 1. Adicionar o novo perfil 'pai_mae' ao ENUM user_role
ALTER TYPE public.user_role ADD VALUE 'pai_mae';

-- 2. Tabela para armazenar as Disciplinas
CREATE TABLE public.subjects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabela de relacionamento Aluno-Responsável (criar antes das políticas que a referenciam)
CREATE TABLE public.student_parent_relations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(student_id, parent_id)
);

-- 4. Tabela de alocação de professores (criar antes das políticas que a referenciam)
CREATE TABLE public.teacher_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE(teacher_id, class_id, subject_id)
);

-- 5. Tabela para armazenar as Notas dos Alunos
CREATE TABLE public.grades (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    grade DECIMAL(4, 2) NOT NULL CHECK (grade >= 0 AND grade <= 10),
    assessment_type TEXT NOT NULL,
    assessment_date DATE NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Tabela para registrar a Frequência
CREATE TABLE public.attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('presente', 'ausente', 'justificado')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Tabela para a Grade de Horários
CREATE TABLE public.schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 5),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Tabela de Comunicados
CREATE TABLE public.announcements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    target_role public.user_role,
    target_class_id UUID REFERENCES public.classes(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AGORA CRIAR AS POLÍTICAS RLS APÓS TODAS AS TABELAS ESTAREM CRIADAS

-- RLS para Disciplinas
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Directors and coordinators can manage subjects" ON public.subjects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para Relacionamentos Aluno-Responsável
ALTER TABLE public.student_parent_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their student relations" ON public.student_parent_relations FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Students can view their parent relations" ON public.student_parent_relations FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Directors and coordinators can manage student-parent relations" ON public.student_parent_relations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para alocações de professores
ALTER TABLE public.teacher_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can view their own allocations" ON public.teacher_allocations FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Directors and coordinators can manage teacher allocations" ON public.teacher_allocations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para Notas
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students and parents can view their own grades" ON public.grades FOR SELECT USING (
    (student_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM public.student_parent_relations WHERE student_id = public.grades.student_id AND parent_id = auth.uid()))
);
CREATE POLICY "Teachers can manage grades for their classes" ON public.grades FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teacher_allocations WHERE teacher_id = auth.uid() AND class_id = public.grades.class_id AND subject_id = public.grades.subject_id)
);
CREATE POLICY "Directors and coordinators can view all grades" ON public.grades FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para Frequência
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students and parents can view their own attendance" ON public.attendance FOR SELECT USING (
    (student_id = auth.uid()) OR 
    (EXISTS (SELECT 1 FROM public.student_parent_relations WHERE student_id = public.attendance.student_id AND parent_id = auth.uid()))
);
CREATE POLICY "Teachers can manage attendance for their classes" ON public.attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teacher_allocations WHERE teacher_id = auth.uid() AND class_id = public.attendance.class_id AND subject_id = public.attendance.subject_id)
);
CREATE POLICY "Directors and coordinators can view all attendance" ON public.attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para Horários
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view schedules" ON public.schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Directors and coordinators can manage schedules" ON public.schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- RLS para Comunicados
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view relevant announcements" ON public.announcements FOR SELECT TO authenticated USING (
    target_role IS NULL OR target_role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can create announcements" ON public.announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('diretor', 'coordenador'))
);

-- Adicionar triggers de 'updated_at' para as novas tabelas
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
