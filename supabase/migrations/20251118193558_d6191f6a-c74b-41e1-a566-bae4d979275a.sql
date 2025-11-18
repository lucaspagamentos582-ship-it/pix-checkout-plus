-- Criar tabela para links de pagamento personalizados
CREATE TABLE public.payment_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  access_count INTEGER NOT NULL DEFAULT 0
);

-- Criar índice para buscar por código rapidamente
CREATE INDEX idx_payment_links_code ON public.payment_links(code);

-- Habilitar RLS
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode visualizar links ativos
CREATE POLICY "Qualquer um pode ver links ativos"
ON public.payment_links
FOR SELECT
USING (is_active = true);

-- Política: apenas admins podem inserir (será controlado pela aplicação)
CREATE POLICY "Permitir inserção pública"
ON public.payment_links
FOR INSERT
WITH CHECK (true);

-- Política: permitir atualização do contador de acessos
CREATE POLICY "Permitir atualização do contador"
ON public.payment_links
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Função para gerar código único
CREATE OR REPLACE FUNCTION generate_payment_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;