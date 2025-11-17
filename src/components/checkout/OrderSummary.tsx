import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const OrderSummary = () => {
  const [amount, setAmount] = useState(214.80);

  useEffect(() => {
    fetchAmount();
  }, []);

  const fetchAmount = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "checkout_amount")
        .single();

      if (error) throw error;

      if (data) {
        setAmount(parseFloat(data.value));
      }
    } catch (error) {
      console.error("Erro ao buscar valor:", error);
    }
  };

  const mockItems: OrderItem[] = [
    { id: "1", name: "TX54114854", price: amount, quantity: 1 },
  ];

  const subtotal = mockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <Card className="p-8 sticky top-4 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Resumo do Pedido</h2>
        <p className="text-sm text-muted-foreground">Confira os detalhes do pagamento</p>
      </div>
      
      <Alert variant="destructive" className="mb-6 border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription className="ml-2 text-sm leading-relaxed">
          <strong>IMPORTANTE:</strong> O não pagamento da taxa alfandegária até o prazo determinado, ocasionará a DEVOLUÇÃO. E SEU NOME SERÁ NEGATIVADO NO SPC E SERASA. Após efetuar o pagamento fique nessa tela.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {mockItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">Taxa Alfandegária</p>
            </div>
            <p className="font-medium text-foreground">
              R$ {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        
        <Separator className="bg-border/50" />
        
        <div className="flex justify-between items-center pt-4">
          <span className="text-lg font-bold text-navy">Total a Pagar</span>
          <div className="text-right">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue to-navy bg-clip-text text-transparent">
              R$ {total.toFixed(2)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">via PIX</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
