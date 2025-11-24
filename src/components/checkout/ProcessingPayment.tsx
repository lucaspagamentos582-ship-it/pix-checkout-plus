import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProcessingPaymentProps {
  customerData: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}

export const ProcessingPayment = ({ customerData }: ProcessingPaymentProps) => {
  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Identificação</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-normal text-gray-400">E-mail</label>
            <div className="mt-1 text-gray-300">{customerData.email}</div>
          </div>

          <div>
            <label className="text-sm font-normal text-gray-400">Telefone</label>
            <div className="mt-1 text-gray-300">{customerData.phone}</div>
          </div>

          <div>
            <label className="text-sm font-normal text-gray-400">Nome completo</label>
            <div className="mt-1 text-gray-300">{customerData.name}</div>
          </div>

          <div>
            <label className="text-sm font-normal text-gray-400">CPF/CNPJ</label>
            <div className="mt-1 text-gray-300">{customerData.cpf}</div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Pagamento</h2>
          
          {/* Processing Animation */}
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300"
              >
                {/* POS Machine Icon */}
                <rect x="35" y="20" width="50" height="70" rx="4" stroke="currentColor" strokeWidth="2" fill="white"/>
                <rect x="40" y="30" width="40" height="25" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="45" y1="62" x2="75" y2="62" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="45" y1="68" x2="75" y2="68" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="45" y1="74" x2="75" y2="74" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="50" y="80" width="20" height="6" rx="1" fill="currentColor"/>
                {/* Receipt */}
                <rect x="42" y="10" width="36" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
              <Loader2 className="w-6 h-6 text-[#00C851] absolute bottom-0 right-8 animate-spin" />
            </div>
            
            <p className="text-lg font-semibold text-gray-600">Processando pagamento!</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-600">
              Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu pagamento.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              disabled
              className="bg-gray-300 text-gray-500 font-semibold py-3 px-12 rounded-md cursor-not-allowed"
            >
              GERAR PIX
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
