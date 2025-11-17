import { useState } from "react";
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

  const handleCustomerDataFilled = (data: CustomerData) => {
    setCustomerData(data);
    setShowPhoneModal(true);
  };

  const handlePhoneConfirm = (phone: string) => {
    setConfirmedPhone(phone);
    setShowPhoneModal(false);
    setShowPayment(true);
  };

  const totalAmount = 214.80; // Subtotal (199.70) + Frete (15.00)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-20 w-auto drop-shadow-lg"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-navy">Checkout Seguro</h1>
              <p className="text-muted-foreground">Finalize sua compra com PIX</p>
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
              />
            )}
          </div>

          <div>
            <OrderSummary />
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
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <span>Ambiente 100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
