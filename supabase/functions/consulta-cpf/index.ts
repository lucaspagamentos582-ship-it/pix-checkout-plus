import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf } = await req.json();

    if (!cpf) {
      console.error('CPF não fornecido');
      return new Response(
        JSON.stringify({ error: true, message: 'CPF é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Consultando CPF: ${cpf}`);

    const cloudApiToken = Deno.env.get('CLOUDAPI_TOKEN');
    
    if (!cloudApiToken) {
      console.error('CLOUDAPI_TOKEN não configurado');
      return new Response(
        JSON.stringify({ error: true, message: 'Configuração do servidor incorreta' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCpf = cpf.replace(/\D/g, '');

    // Fazer requisição para a CloudAPI
    const apiUrl = `https://api.apinow.sbs/api/cpf?token=${cloudApiToken}&cpf=${cleanCpf}`;
    console.log('Fazendo requisição para CloudAPI...');

    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('Resposta da CloudAPI:', JSON.stringify(data));

    // Verificar se houve erro na resposta
    // A API retorna diretamente { error: false, nome: "...", ... } quando sucesso
    // Ou { error: true, message: "..." } quando há erro
    if (data.error === true) {
      console.error('Erro na resposta da CloudAPI:', data);
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: data.message || 'CPF não encontrado ou inválido' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Os dados vêm diretamente na resposta, não dentro de "data"
    // Retornar dados formatados
    return new Response(
      JSON.stringify({
        error: false,
        nome: data.nome,
        nascimento: data.nascimento,
        mae: data.mae,
        sexo: data.sexo,
        cpf: data.cpf
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: 'Erro ao processar consulta: ' + errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
