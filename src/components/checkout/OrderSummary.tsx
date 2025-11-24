import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import correiosIcon from "@/assets/logo.png";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  amount: number;
}

export const OrderSummary = ({ amount }: OrderSummaryProps) => {

  const mockItems: OrderItem[] = [
    { id: "1", name: "TX54114854", price: amount, quantity: 1 },
  ];

  const subtotal = mockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Seu carrinho</h2>
      </div>
      
      <div className="space-y-4">
        {mockItems.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
              <img src={correiosIcon} alt="Correios" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">1 un.</p>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
