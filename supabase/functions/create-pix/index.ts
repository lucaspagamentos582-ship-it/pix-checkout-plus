import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePixRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  paymentLinkCode?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados nas variáveis de ambiente");
}

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    persistSession: false,
  },
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, customerName, customerEmail, customerCpf, paymentLinkCode }: CreatePixRequest =
      await req.json();

    console.log("Creating PIX payment for:", { amount, customerName, customerEmail, paymentLinkCode });

    let publicKey = Deno.env.get("FUSIONPAY_PUBLIC_KEY") || "";
    let secretKey = Deno.env.get("FUSIONPAY_SECRET_KEY") || "";
    let keySource: "env" | "user" = "env";

    // Se vier um código de link de pagamento, tentamos usar as chaves do vendedor
    if (paymentLinkCode) {
      console.log("Buscando usuário do payment_link pelo código:", paymentLinkCode);

      const { data: paymentLink, error: linkError } = await supabase
        .from("payment_links")
        .select("user_id")
        .eq("code", paymentLinkCode)
        .eq("is_active", true)
        .single();

      if (linkError) {
        console.error("Erro ao buscar payment_link:", linkError);
        throw new Error("Link de pagamento inválido ou inativo");
      }

      if (!paymentLink?.user_id) {
        console.error("payment_link encontrado, mas sem user_id vinculado");
        throw new Error("Link de pagamento sem vendedor vinculado");
      }

      console.log("Buscando chaves FusionPay em user_payment_settings para user_id:", paymentLink.user_id);

      const { data: settings, error: settingsError } = await supabase
        .from("user_payment_settings")
        .select("fusionpay_public_key, fusionpay_secret_key")
        .eq("user_id", paymentLink.user_id)
        .single();

      if (settingsError) {
        console.error("Erro ao buscar user_payment_settings:", settingsError);
        throw new Error("Chaves de pagamento não configuradas para este vendedor");
      }

      if (!settings?.fusionpay_public_key || !settings?.fusionpay_secret_key) {
        console.error("user_payment_settings encontrados, mas sem ambas as chaves");
        throw new Error("Chaves FusionPay incompletas para este vendedor");
      }

      publicKey = settings.fusionpay_public_key;
      secretKey = settings.fusionpay_secret_key;
      keySource = "user";
    }

    console.log("Fonte das chaves FusionPay:", keySource);
    console.log("Public Key presente:", !!publicKey);
    console.log("Secret Key presente:", !!secretKey);

    if (!publicKey || !secretKey) {
      throw new Error("FusionPay credentials not configured");
    }

    // Create Basic Auth credentials (secretKey:publicKey)
    const credentials = btoa(`${secretKey}:${publicKey}`);

    // Convert amount to cents (FusionPay expects amount in centavos)
    const amountInCents = Math.round(amount * 100);

    // Call FusionPay API to create PIX transaction
    const response = await fetch("https://api.fusionpaybr.com.br/api/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: amountInCents,
        paymentMethod: "pix",
        pix: {
          expiresIn: 600, // 10 minutos de expiração
        },
        items: [
          {
            title: "Taxa Alfandegaria",
            unitPrice: amountInCents,
            quantity: 1,
            tangible: false,
          },
        ],
        customer: {
          name: customerName,
          email: customerEmail,
          document: {
            type: "cpf",
            number: customerCpf.replace(/\D/g, ""), // Remove formatação do CPF
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FusionPay API error:", response.status, errorText);
      throw new Error(`FusionPay API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("PIX payment created successfully:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-pix function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
