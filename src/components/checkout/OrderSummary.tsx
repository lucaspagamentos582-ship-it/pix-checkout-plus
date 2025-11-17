import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const mockItems: OrderItem[] = [
  { id: "1", name: "Black Friday", price: 214.80, quantity: 1 },
];

export const OrderSummary = () => {
  const subtotal = mockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Resumo do Pedido</h2>
      
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>IMPORTANTE:</strong> O não pagamento da taxa alfandegária até o prazo determinado, ocasionará a DEVOLUÇÃO. E SEU NOME SERÁ NEGATIVADO NO SPC E SERASA. Após efetuar o pagamento fique nessa tela.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {mockItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">Oferta Especial</p>
            </div>
            <p className="font-medium text-foreground">
              R$ {(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-foreground">Total a Pagar</span>
          <span className="text-2xl font-bold text-primary">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
};
