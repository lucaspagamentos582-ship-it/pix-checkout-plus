import { Shield, Zap, CheckCircle2 } from "lucide-react";

export const TrustBadges = () => {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Ambiente seguro</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Pix Imediato!</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Após o pagamento da taxa o produto é liberado em até 24 Horas.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Verificação</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Empresa autorizada e verificada a receber valores de taxa federal.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex-shrink-0">
          <span className="text-white font-bold text-xs">GOV</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Governo Federal</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Programa do Governo Federal 2025
          </p>
        </div>
      </div>
    </div>
  );
};
