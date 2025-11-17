import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePixRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, customerName, customerEmail, customerCpf }: CreatePixRequest = await req.json();
    
    console.log('Creating PIX payment for:', { amount, customerName, customerEmail });

    const publicKey = Deno.env.get('FUSIONPAY_PUBLIC_KEY');
    const secretKey = Deno.env.get('FUSIONPAY_SECRET_KEY');

    if (!publicKey || !secretKey) {
      throw new Error('FusionPay credentials not configured');
    }

    // Create Basic Auth credentials (publicKey:secretKey)
    const credentials = btoa(`${publicKey}:${secretKey}`);

    // Convert amount to cents (FusionPay expects amount in centavos)
    const amountInCents = Math.round(amount * 100);

    // Call FusionPay API to create PIX transaction
    const response = await fetch('https://api.fusionpaybr.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInCents,
        paymentMethod: 'pix',
        pix: {
          expiresIn: 3600, // 1 hora de expiração
        },
        items: [
          {
            title: 'Black Friday',
            unitPrice: amountInCents,
            quantity: 1,
            tangible: false,
          },
        ],
        customer: {
          name: customerName,
          email: customerEmail,
          document: {
            type: 'cpf',
            number: customerCpf.replace(/\D/g, ''), // Remove formatação do CPF
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FusionPay API error:', response.status, errorText);
      throw new Error(`FusionPay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('PIX payment created successfully:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-pix function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
