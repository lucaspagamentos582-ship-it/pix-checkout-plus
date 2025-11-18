import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";

interface PaymentKeysManagerProps {
  userId: string;
}

export function PaymentKeysManager({ userId }: PaymentKeysManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [hasSettings, setHasSettings] = useState(false);

  useEffect(() => {
    fetchPaymentKeys();
  }, [userId]);

  const fetchPaymentKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_payment_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPublicKey(data.fusionpay_public_key || "");
        setSecretKey(data.fusionpay_secret_key || "");
        setHasSettings(true);
      }
    } catch (error) {
      console.error("Erro ao buscar chaves:", error);
      toast.error("Erro ao carregar chaves de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!publicKey || !secretKey) {
      toast.error("Preencha ambas as chaves");
      return;
    }

    try {
      setSaving(true);

      if (hasSettings) {
        // Atualizar
        const { error } = await supabase
          .from("user_payment_settings")
          .update({
            fusionpay_public_key: publicKey,
            fusionpay_secret_key: secretKey,
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from("user_payment_settings")
          .insert({
            user_id: userId,
            fusionpay_public_key: publicKey,
            fusionpay_secret_key: secretKey,
          });

        if (error) throw error;
        setHasSettings(true);
      }

      toast.success("Chaves salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar chaves:", error);
      toast.error("Erro ao salvar chaves de pagamento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2">
          <Key className="h-6 w-6 text-blue" />
          Chaves API do Gateway de Pagamento
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure suas chaves FusionPay para receber pagamentos
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="publicKey">Chave Pública (Public Key)</Label>
          <Input
            id="publicKey"
            type="text"
            placeholder="pk_live_..."
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secretKey">Chave Secreta (Secret Key)</Label>
          <div className="relative">
            <Input
              id="secretKey"
              type={showSecretKey ? "text" : "password"}
              placeholder="sk_live_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={saving}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowSecretKey(!showSecretKey)}
            >
              {showSecretKey ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !publicKey || !secretKey}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Chaves"
          )}
        </Button>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">⚠️ Importante:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Nunca compartilhe suas chaves secretas</li>
            <li>Use apenas chaves de produção (live)</li>
            <li>Guarde suas chaves em local seguro</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
