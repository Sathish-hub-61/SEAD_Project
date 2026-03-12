CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete exams" ON public.exams FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));