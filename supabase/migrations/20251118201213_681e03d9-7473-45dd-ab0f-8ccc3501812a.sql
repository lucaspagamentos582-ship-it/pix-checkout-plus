-- Permitir que usuários anônimos leiam a tabela settings (para valor do checkout)
DROP POLICY IF EXISTS "Qualquer um pode ver configurações" ON public.settings;

CREATE POLICY "Public can read settings"
    ON public.settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Garantir que apenas autenticados possam atualizar
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar" ON public.settings;

CREATE POLICY "Authenticated users can update settings"
    ON public.settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);