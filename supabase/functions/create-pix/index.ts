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

    const secretKey = Deno.env.get('GHOSTSPAY_SECRET_KEY');
    const companyId = Deno.env.get('GHOSTSPAY_COMPANY_ID');

    if (!secretKey || !companyId) {
      throw new Error('GhostsPay credentials not configured');
    }

    // Create Basic Auth credentials
    const credentials = btoa(`${secretKey}:${companyId}`);

    // Call GhostsPay API to create PIX transaction
    const response = await fetch('https://api.ghostspaysv2.com/functions/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        customer: {
          name: customerName,
          email: customerEmail,
          document: customerCpf,
        },
        paymentMethod: 'pix',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GhostsPay API error:', response.status, errorText);
      throw new Error(`GhostsPay API error: ${response.status} - ${errorText}`);
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
