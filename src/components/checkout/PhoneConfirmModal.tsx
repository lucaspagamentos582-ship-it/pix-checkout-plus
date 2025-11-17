import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import { Phone } from "lucide-react";

interface PhoneConfirmModalProps {
  isOpen: boolean;
  initialPhone: string;
  onConfirm: (phone: string) => void;
  onCancel: () => void;
}

export const PhoneConfirmModal = ({
  isOpen,
  initialPhone,
  onConfirm,
  onCancel,
}: PhoneConfirmModalProps) => {
  const [phone, setPhone] = useState(initialPhone);

  const handleConfirm = () => {
    if (phone.replace(/\D/g, "").length === 11) {
      onConfirm(phone);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Confirme seu Telefone</DialogTitle>
          <DialogDescription className="text-center">
            Verifique se seu número de telefone está correto. Usaremos para entrar em contato sobre o pedido.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-phone">Número de Telefone</Label>
            <InputMask
              mask="(99) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  id="confirm-phone"
                  placeholder="(00) 00000-0000"
                />
              )}
            </InputMask>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90"
          >
            Confirmar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
