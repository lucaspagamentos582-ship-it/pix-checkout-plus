import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Admin() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentAmount();
  }, []);

  const fetchCurrentAmount = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "checkout_amount")
        .single();

      if (error) throw error;

      if (data) {
        setAmount(data.value);
      }
    } catch (error) {
      console.error("Erro ao buscar valor:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("settings")
        .update({ value: amount })
        .eq("key", "checkout_amount");

      if (error) throw error;

      toast.success("Valor atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar valor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-navy via-blue to-navy bg-clip-text text-transparent mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Main Content */}
        <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue" />
              Valor do Checkout
            </h2>
            <p className="text-sm text-muted-foreground">
              Defina o valor da taxa alfandegária
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor em Reais (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="214.80"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Este será o valor exibido no checkout
                </p>
              </div>

              <div className="p-4 bg-blue/10 rounded-lg border border-blue/20">
                <p className="text-sm text-navy">
                  <span className="font-semibold">Visualização:</span>
                  <span className="block text-2xl font-bold bg-gradient-to-r from-blue to-navy bg-clip-text text-transparent mt-2">
                    R$ {amount || "0.00"}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue to-blue/90 hover:from-blue/90 hover:to-blue shadow-blue transition-all duration-300 hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
