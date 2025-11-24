import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import InputMask from "react-input-mask";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PixIcon } from "@/components/icons/PixIcon";

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
          
          <div className="border-2 border-[#32BCAD] rounded-md p-3 mb-4 inline-block">
            <div className="flex items-center gap-2">
              <PixIcon size={24} className="text-[#32BCAD]" />
              <span className="text-sm text-gray-600">pix</span>
            </div>
          </div>

          <div className="border border-gray-300 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-600">
              Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu pagamento.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoadingCpf}
              className="bg-[#00C851] hover:bg-[#00B347] text-white font-semibold py-3 px-12 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingCpf ? "Carregando..." : "GERAR PIX"}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
};
