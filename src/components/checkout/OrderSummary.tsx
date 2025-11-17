import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const mockItems: OrderItem[] = [
  { id: "1", name: "TX54114854", price: 214.80, quantity: 1 },
];

export const OrderSummary = () => {
  const subtotal = mockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Resumo do Pedido</h2>
      
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
