import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PixPaymentProps {
  amount: number;
  customerName: string;
}

export const PixPayment = ({ amount, customerName }: PixPaymentProps) => {
  const [copied, setCopied] = useState(false);
  
  // Em produção, este código seria gerado pelo backend/API de pagamento
  const pixCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(7)}52040000530398654${amount.toFixed(2)}5802BR5913${customerName}6009SAO PAULO62070503***6304${Math.random().toString(36).substring(7)}`;

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 rounded-full p-3">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
        Pagamento via PIX
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        Escaneie o QR Code ou copie o código para pagar
      </p>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <QRCodeSVG
            value={pixCode}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground mb-2">Código PIX</p>
        <p className="text-xs font-mono break-all text-foreground">
          {pixCode}
        </p>
      </div>

      <Button
        onClick={handleCopyPixCode}
        variant="outline"
        className="w-full"
      >
        {copied ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
            Código Copiado!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copiar Código PIX
          </>
        )}
      </Button>

      <div className="mt-6 p-4 bg-secondary/20 rounded-lg border-2 border-secondary">
        <p className="text-sm text-center text-foreground">
          <span className="font-semibold">Valor a pagar:</span>
          <br />
          <span className="text-2xl font-bold text-primary">
            R$ {amount.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        O pagamento será confirmado automaticamente após a compensação
      </div>
    </Card>
  );
};
