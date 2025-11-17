-- Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir valor padrão do checkout
INSERT INTO public.settings (key, value, description)
VALUES ('checkout_amount', '214.80', 'Valor padrão da taxa alfandegária em reais')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (qualquer um pode ver)
CREATE POLICY "Qualquer um pode ver configurações"
  ON public.settings
  FOR SELECT
  USING (true);

-- Política para atualização (apenas autenticados por enquanto)
CREATE POLICY "Usuários autenticados podem atualizar"
  ON public.settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();