import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import correiosIcon from "@/assets/logo.png";
import pixLogo from "@/assets/pix-logo.png";

interface PixPaymentProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  paymentLinkCode?: string;
}

export const PixPayment = ({ amount, customerName, customerEmail, customerCpf, paymentLinkCode }: PixPaymentProps) => {
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
            paymentLinkCode,
          },
        });

        if (functionError) {
          console.error('Error creating PIX:', functionError);
          throw new Error(functionError.message || 'Erro ao criar pagamento PIX');
        }

        if (data?.pix) {
          const pixData = data.pix;
          
          if (pixData.qrcode) {
            setPixCode(pixData.qrcode);
            setQrCodeData(pixData.qrcode);
          }

          const expiration = new Date();
          expiration.setMinutes(expiration.getMinutes() + 10);
          setExpirationDate(expiration);
        } else {
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
  }, [amount, customerName, customerEmail, customerCpf, paymentLinkCode]);

  useEffect(() => {
    if (!expirationDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = expirationDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining("00:00");
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
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
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-[#00C851]" />
            <p className="text-gray-600 mt-6 text-lg">Gerando seu PIX...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 text-center mb-4 text-lg font-semibold">{error}</p>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Por favor, tente novamente ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm py-4 px-8">
        <img src={correiosIcon} alt="Correios" className="h-8 w-auto" />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-center text-2xl font-semibold text-gray-700 mb-8">
          Falta pouco! Para finalizar a compra,<br />escaneie o QR Code abaixo.
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">
                O código expira em: <span className="text-red-600 font-semibold">{timeRemaining}</span>
              </p>
            </div>

            {/* QR Code */}
            {qrCodeData && !isExpired && (
              <div className="flex justify-center mb-8">
                <div className="bg-white p-4">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={280}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            )}

            {/* PIX Code */}
            {pixCode && !isExpired && (
              <div>
                <p className="text-center text-gray-700 mb-3 font-medium">
                  Se preferir, pague com a opção PIX Copia e Cola:
                </p>
                
                <div className="bg-white border border-gray-300 rounded-md p-3 mb-4">
                  <p className="text-xs font-mono break-all text-gray-700">
                    {pixCode}
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleCopyPixCode}
                    className="bg-[#00C851] hover:bg-[#00B347] text-white font-bold py-4 px-10 rounded-md transition-colors inline-flex items-center gap-2 text-base shadow-lg"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        CÓDIGO COPIADO
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        COPIAR CÓDIGO
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="text-center p-8 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-red-600 font-bold text-lg mb-2">PIX Expirado</p>
                <p className="text-sm text-gray-600">
                  Este código PIX expirou. Por favor, atualize a página para gerar um novo.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-gray-700 font-semibold mb-4">Detalhes da compra:</h3>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Valor total: <span className="text-[#00C851] font-bold text-lg">R$ {amount.toFixed(2)}</span>
                </p>
              </div>

              <div className="flex items-center mb-6">
                <img src={correiosIcon} alt="Correios" className="h-12 w-auto" />
              </div>

              <h3 className="text-gray-700 font-semibold mb-4">Instruções para pagamento</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00C851] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 pt-2">
                    Abra o app do seu banco e entre no ambiente Pix
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00C851] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 pt-2">
                    Escolha Pagar com QR Code e aponte a câmera para o código ao lado.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00C851] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 pt-2">
                    Confirme as informações e finalize sua compra.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Logos */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <img src={pixLogo} alt="PIX" className="h-8 w-auto" />
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Ambiente seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
