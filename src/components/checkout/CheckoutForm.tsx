import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import InputMask from "react-input-mask";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomerData = async (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, "");
    
    if (cleanCpf.length !== 11) return;

    setIsLoading(true);
    
    try {
      // Simulando busca de dados - em produção, usar uma API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados para demonstração
      const mockData = {
        name: "João da Silva Santos",
        email: "joao.silva@email.com",
        phone: "(11) 98765-4321"
      };
      
      setName(mockData.name);
      setEmail(mockData.email);
      setPhone(mockData.phone);
      
      toast.success("Dados encontrados! Confirme seu telefone.");
    } catch (error) {
      toast.error("Erro ao buscar dados. Preencha manualmente.");
    } finally {
      setIsLoading(false);
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
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Informações do Cliente</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <InputMask
            mask="999.999.999-99"
            value={cpf}
            onChange={handleCpfChange}
            disabled={isLoading}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="cpf"
                placeholder="000.000.000-00"
                required
              />
            )}
          </InputMask>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <InputMask
            mask="(99) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="phone"
                placeholder="(00) 00000-0000"
                required
              />
            )}
          </InputMask>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando dados...
            </>
          ) : (
            "Continuar para Pagamento"
          )}
        </Button>
      </form>
    </Card>
  );
};
