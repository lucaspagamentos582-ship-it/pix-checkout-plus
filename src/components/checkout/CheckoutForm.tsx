import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import InputMask from "react-input-mask";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface CheckoutFormProps {
  onCustomerDataFilled: (data: CustomerData) => void;
}

export const CheckoutForm = ({ onCustomerDataFilled }: CheckoutFormProps) => {
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);

  const fetchCustomerData = async (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, "");
    
    if (cleanCpf.length !== 11) return;

    setIsLoadingCpf(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('consulta-cpf', {
        body: { cpf: cleanCpf }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.message || "CPF não encontrado");
        return;
      }

      setName(data.nome);
      toast.success("Dados encontrados! Preencha email e telefone.");
    } catch (error) {
      console.error('Erro ao buscar CPF:', error);
      toast.error("Erro ao buscar dados. Preencha manualmente.");
    } finally {
      setIsLoadingCpf(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCpf(value);
    
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length === 11) {
      fetchCustomerData(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf || !name || !email || !phone) {
      toast.error("Preencha todos os campos");
      return;
    }

    onCustomerDataFilled({
      cpf,
      name,
      email,
      phone
    });
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Identificação</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-normal text-gray-700">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-normal text-gray-700">Telefone</Label>
            <InputMask
              mask="(99) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="phone"
                  type="tel"
                  placeholder="(99) 99999-9999"
                  required
                  className="mt-1"
                />
              )}
            </InputMask>
          </div>

          <div>
            <Label htmlFor="name" className="text-sm font-normal text-gray-700">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nome e Sobrenome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cpf" className="text-sm font-normal text-gray-700">CPF/CNPJ</Label>
            <InputMask
              mask="999.999.999-99"
              value={cpf}
              onChange={handleCpfChange}
              disabled={isLoadingCpf}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="cpf"
                  type="text"
                  placeholder="123.456.789-12"
                  required
                  className="mt-1"
                />
              )}
            </InputMask>
          </div>
        </div>

        <Separator className="my-6" />

        <div>
          <h2 className="text-lg font-semibold mb-4">Pagamento</h2>
          
          <div className="border-2 border-blue-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💳</div>
              <span className="font-medium">PIX</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu pagamento.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoadingCpf}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingCpf ? "Carregando..." : "GERAR PIX"}
          </button>
        </div>
      </form>
    </Card>
  );
};
