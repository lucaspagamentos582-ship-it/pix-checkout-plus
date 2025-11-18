-- Criar tabela para rastrear pagamentos
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payment_link_id uuid REFERENCES public.payment_links(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, confirmed, expired, failed
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_cpf text NOT NULL,
    pix_code text,
    transaction_id text,
    fusion_transaction_id text,
    created_at timestamp with time zone DEFAULT now(),
    confirmed_at timestamp with time zone,
    expires_at timestamp with time zone
);

-- Criar índices para performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_payment_link_id ON public.payments(payment_link_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para payments
CREATE POLICY "Users can view their own payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
    ON public.payments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_links', (
            SELECT COUNT(*)::int 
            FROM payment_links 
            WHERE user_id = _user_id AND is_active = true
        ),
        'total_visits', (
            SELECT COALESCE(SUM(access_count), 0)::int 
            FROM payment_links 
            WHERE user_id = _user_id
        ),
        'total_payments', (
            SELECT COUNT(*)::int 
            FROM payments 
            WHERE user_id = _user_id
        ),
        'pending_payments', (
            SELECT COUNT(*)::int 
            FROM payments 
            WHERE user_id = _user_id AND status = 'pending'
        ),
        'confirmed_payments', (
            SELECT COUNT(*)::int 
            FROM payments 
            WHERE user_id = _user_id AND status = 'confirmed'
        ),
        'total_amount_pending', (
            SELECT COALESCE(SUM(amount), 0)::numeric 
            FROM payments 
            WHERE user_id = _user_id AND status = 'pending'
        ),
        'total_amount_confirmed', (
            SELECT COALESCE(SUM(amount), 0)::numeric 
            FROM payments 
            WHERE user_id = _user_id AND status = 'confirmed'
        ),
        'recent_payments', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', id,
                    'amount', amount,
                    'status', status,
                    'customer_name', customer_name,
                    'created_at', created_at
                ) ORDER BY created_at DESC
            ), '[]'::json)
            FROM (
                SELECT id, amount, status, customer_name, created_at
                FROM payments
                WHERE user_id = _user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) recent
        )
    ) INTO result;
    
    RETURN result;
END;
$$;