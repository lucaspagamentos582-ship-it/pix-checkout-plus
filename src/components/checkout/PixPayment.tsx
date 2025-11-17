import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle, Loader2, Clock, AlertTriangle } from "lucide-react";
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

          // Definir expiração para 10 minutos a partir de agora
          const expiration = new Date();
          expiration.setMinutes(expiration.getMinutes() + 10);
          setExpirationDate(expiration);
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
      <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-blue/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-blue relative z-10" />
          </div>
          <p className="text-muted-foreground mt-6 text-lg">Gerando seu PIX...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 shadow-lg border-2 border-destructive/50 bg-card/95 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-destructive/10 rounded-full p-4 mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <p className="text-destructive text-center mb-4 text-lg font-semibold">{error}</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Por favor, tente novamente ou entre em contato com o suporte.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-br from-blue to-blue/80 rounded-full p-4 shadow-blue">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-navy mb-2">
          Pagamento via PIX
        </h2>
        <p className="text-muted-foreground">
          Escaneie o QR Code ou copie o código para pagar
        </p>
      </div>

      {/* Countdown Timer */}
      {expirationDate && (
        <div className={`mb-8 p-6 rounded-xl border-2 shadow-lg ${isExpired ? 'bg-destructive/10 border-destructive shadow-destructive/20' : 'bg-gradient-to-br from-yellow/20 to-blue/10 border-yellow shadow-yellow/20'}`}>
          <div className="flex items-center justify-center gap-3">
            <Clock className={`h-6 w-6 ${isExpired ? 'text-destructive' : 'text-blue'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-navy mb-1">
                {isExpired ? 'PIX Expirado' : 'Tempo restante'}
              </p>
              <p className={`text-3xl font-bold ${isExpired ? 'text-destructive' : 'bg-gradient-to-r from-blue to-navy bg-clip-text text-transparent'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>
        </div>
      )}

      {qrCodeData && !isExpired && (
        <div className="flex justify-center mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-blue/20">
            <QRCodeSVG
              value={qrCodeData}
              size={220}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      )}

      {pixCode && !isExpired && (
        <>
          <div className="bg-muted/50 backdrop-blur-sm rounded-xl p-5 mb-5 border border-border/50">
            <p className="text-sm font-semibold text-navy mb-3">Código PIX</p>
            <p className="text-xs font-mono break-all text-foreground leading-relaxed">
              {pixCode}
            </p>
          </div>

          <Button
            onClick={handleCopyPixCode}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-yellow to-yellow/90 hover:from-yellow/90 hover:to-yellow text-navy shadow-yellow transition-all duration-300 hover:scale-[1.02]"
          >
            {copied ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Código Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Copiar Código PIX
              </>
            )}
          </Button>
        </>
      )}

      {isExpired && (
        <div className="text-center p-8 bg-destructive/10 rounded-xl border-2 border-destructive">
          <p className="text-destructive font-bold text-lg mb-2">PIX Expirado</p>
          <p className="text-sm text-muted-foreground">
            Este código PIX expirou. Por favor, atualize a página para gerar um novo.
          </p>
        </div>
      )}

      <div className="mt-8 p-5 bg-gradient-to-br from-blue/10 to-yellow/10 rounded-xl border-2 border-blue/30 shadow-md">
        <p className="text-sm text-center text-navy font-medium">
          <span className="font-bold text-lg block mb-1">Valor a pagar:</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue to-navy bg-clip-text text-transparent">
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
