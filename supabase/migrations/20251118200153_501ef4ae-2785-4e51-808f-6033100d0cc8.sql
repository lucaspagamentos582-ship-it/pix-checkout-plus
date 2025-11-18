-- Adicionar user_id aos payment_links para rastrear qual admin criou
ALTER TABLE public.payment_links 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX idx_payment_links_user_id ON public.payment_links(user_id);

-- Criar tabela para configurações de pagamento por usuário
CREATE TABLE public.user_payment_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    fusionpay_public_key text,
    fusionpay_secret_key text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_payment_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_payment_settings
CREATE POLICY "Users can view their own payment settings"
    ON public.user_payment_settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment settings"
    ON public.user_payment_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment settings"
    ON public.user_payment_settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Atualizar políticas de payment_links para isolamento por usuário
DROP POLICY IF EXISTS "Qualquer um pode ver links ativos" ON public.payment_links;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.payment_links;
DROP POLICY IF EXISTS "Permitir atualização do contador" ON public.payment_links;

-- Políticas novas com isolamento por usuário
CREATE POLICY "Users can view their own payment links"
    ON public.payment_links
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment links"
    ON public.payment_links
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment links"
    ON public.payment_links
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment links"
    ON public.payment_links
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Política para acesso público aos links ativos (para clientes pagarem)
CREATE POLICY "Public can view active payment links"
    ON public.payment_links
    FOR SELECT
    TO anon
    USING (is_active = true);

-- Política para atualizar contador de acesso (público)
CREATE POLICY "Public can update access count"
    ON public.payment_links
    FOR UPDATE
    TO anon
    USING (is_active = true)
    WITH CHECK (is_active = true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_payment_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_payment_settings_timestamp
    BEFORE UPDATE ON public.user_payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_payment_settings_updated_at();