-- Atualizar trigger para criar usuários com role 'admin' por padrão
-- Já que todos os usuários são sellers/administradores
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir com role 'admin' por padrão, já que todos são sellers
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'admin');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Atualizar usuários existentes para admin (se houver algum com role 'user')
UPDATE public.user_roles 
SET role = 'admin' 
WHERE role = 'user';