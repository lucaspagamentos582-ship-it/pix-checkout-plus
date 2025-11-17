import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle, Loader2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
}

export const PixPayment = ({ amount, customerName, customerEmail, customerCpf }: PixPaymentProps) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pixCode, setPixCode] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const createPixPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: functionError } = await supabase.functions.invoke('create-pix', {
          body: {
            amount,
            customerName,
            customerEmail,
            customerCpf,
          },
        });

        if (functionError) {
          console.error('Error creating PIX:', functionError);
          throw new Error(functionError.message || 'Erro ao criar pagamento PIX');
        }

        console.log('PIX payment response:', data);

        // Estrutura da resposta FusionPay: data.pix
        if (data?.pix) {
          const pixData = data.pix;
          
          // qrcode é o código PIX copia e cola (brcode)
          if (pixData.qrcode) {
            setPixCode(pixData.qrcode);
            setQrCodeData(pixData.qrcode); // QR code será gerado a partir do qrcode
          }

          // Pegar data de expiração
          if (pixData.expirationDate) {
            setExpirationDate(new Date(pixData.expirationDate));
          }
        } else {
          console.error('PIX data not found in response:', data);
          throw new Error('Dados do PIX não foram retornados pela API');
        }

        toast.success('PIX gerado com sucesso!');
      } catch (err) {
        console.error('Failed to create PIX:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar PIX';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createPixPayment();
  }, [amount, customerName, customerEmail, customerCpf]);

  // Countdown timer
  useEffect(() => {
    if (!expirationDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = expirationDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining("Expirado");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expirationDate]);

  const handleCopyPixCode = () => {
    if (!pixCode) return;
    
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Gerando seu PIX...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive text-center mb-4">{error}</p>
          <p className="text-sm text-muted-foreground text-center">
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>
        </div>
      </Card>
    );
  }

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

      {/* Countdown Timer */}
      {expirationDate && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${isExpired ? 'bg-destructive/10 border-destructive' : 'bg-primary/10 border-primary'}`}>
          <div className="flex items-center justify-center gap-2">
            <Clock className={`h-5 w-5 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isExpired ? 'PIX Expirado' : 'Tempo restante'}
              </p>
              <p className={`text-2xl font-bold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>
        </div>
      )}

      {qrCodeData && !isExpired && (
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <QRCodeSVG
              value={qrCodeData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      )}

      {pixCode && !isExpired && (
        <>
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
        </>
      )}

      {isExpired && (
        <div className="text-center p-6 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-semibold mb-2">PIX Expirado</p>
          <p className="text-sm text-muted-foreground">
            Este código PIX expirou. Por favor, atualize a página para gerar um novo.
          </p>
        </div>
      )}

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
