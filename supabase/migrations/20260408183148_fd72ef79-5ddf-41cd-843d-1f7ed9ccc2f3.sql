
-- 1. Allow signup without a company
ALTER TABLE public.profiles ALTER COLUMN empresa_id DROP NOT NULL;

-- 2. Recreate the trigger function to handle null empresa_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, empresa_id, nome_completo)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.raw_user_meta_data->>'empresa_id' IS NOT NULL
        AND NEW.raw_user_meta_data->>'empresa_id' != ''
      THEN (NEW.raw_user_meta_data->>'empresa_id')::UUID
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente_visualizador');

  RETURN NEW;
END;
$$;

-- 3. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
