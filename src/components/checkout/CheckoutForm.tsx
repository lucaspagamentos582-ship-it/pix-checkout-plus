import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomerData = async (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, "");
    
    if (cleanCpf.length !== 11) return;

    setIsLoading(true);
    
    try {
      console.log('Consultando CPF:', cleanCpf);
      
      const { data, error } = await supabase.functions.invoke('consulta-cpf', {
        body: { cpf: cleanCpf }
      });

      if (error) {
        console.error('Erro ao chamar função:', error);
        throw error;
      }

      console.log('Resposta da função:', data);

      if (data.error) {
        toast.error(data.message || "CPF não encontrado");
        return;
      }

      // Preencher dados retornados pela API
      setName(data.nome);
      // Como a API não retorna email, vamos gerar um email temporário
      setEmail(`${cleanCpf}@temp.com`);
      // Não preencher telefone, deixar para o usuário preencher
      setPhone("");
      
      toast.success("Dados encontrados! Preencha seu telefone.");
    } catch (error) {
      console.error('Erro ao buscar CPF:', error);
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
    <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy mb-2">Informações do Cliente</h2>
        <p className="text-sm text-muted-foreground">Preencha seus dados para prosseguir</p>
      </div>
      
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
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue to-blue/90 hover:from-blue/90 hover:to-blue shadow-blue transition-all duration-300 hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
