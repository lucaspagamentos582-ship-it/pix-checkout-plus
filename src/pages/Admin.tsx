import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, ArrowLeft, Link2, Copy, Plus, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Separator } from "@/components/ui/separator";
import type { User, Session } from "@supabase/supabase-js";

interface PaymentLink {
  id: string;
  code: string;
  amount: number;
  description: string | null;
  is_active: boolean;
  access_count: number;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Payment Links state
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [newLinkAmount, setNewLinkAmount] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);

  useEffect(() => {
    // Configurar listener de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Verificar role admin quando session mudar
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setCheckingAuth(false);
        }
      }
    );

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setCheckingAuth(false);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin', { _user_id: userId });

      if (error) {
        console.error("Erro ao verificar role:", error);
        toast.error("Erro ao verificar permissões");
        navigate("/auth");
        return;
      }

      if (!data) {
        toast.error("Acesso negado. Você não tem permissão de administrador.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setCheckingAuth(false);
      
      // Carregar dados apenas se for admin
      fetchCurrentAmount();
      fetchPaymentLinks();
    } catch (error) {
      console.error("Erro ao verificar admin:", error);
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const fetchCurrentAmount = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "checkout_amount")
        .single();

      if (error) throw error;

      if (data) {
        setAmount(data.value);
      }
    } catch (error) {
      console.error("Erro ao buscar valor:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("settings")
        .update({ value: amount })
        .eq("key", "checkout_amount");

      if (error) throw error;

      toast.success("Valor atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar valor");
    } finally {
      setSaving(false);
    }
  };

  const fetchPaymentLinks = async () => {
    try {
      setLoadingLinks(true);
      const { data, error } = await supabase
        .from("payment_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPaymentLinks(data || []);
    } catch (error) {
      console.error("Erro ao buscar links:", error);
      toast.error("Erro ao carregar links de pagamento");
    } finally {
      setLoadingLinks(false);
    }
  };

  const generateUniqueCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_payment_code');
    
    if (error) throw error;
    
    // Verificar se já existe
    const { data: existing } = await supabase
      .from("payment_links")
      .select("code")
      .eq("code", data)
      .single();
    
    if (existing) {
      // Se já existe, tentar novamente
      return generateUniqueCode();
    }
    
    return data;
  };

  const handleCreateLink = async () => {
    if (!newLinkAmount || isNaN(parseFloat(newLinkAmount))) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    try {
      setCreatingLink(true);

      const code = await generateUniqueCode();

      const { error } = await supabase
        .from("payment_links")
        .insert({
          code,
          amount: parseFloat(newLinkAmount),
          description: newLinkDescription || null,
        });

      if (error) throw error;

      toast.success("Link criado com sucesso!");
      setNewLinkAmount("");
      setNewLinkDescription("");
      fetchPaymentLinks();
    } catch (error) {
      console.error("Erro ao criar link:", error);
      toast.error("Erro ao criar link de pagamento");
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/pagar/${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Link excluído com sucesso!");
      fetchPaymentLinks();
    } catch (error) {
      console.error("Erro ao excluir link:", error);
      toast.error("Erro ao excluir link");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <img src={logo} alt="Logo" className="h-16 w-auto" />

          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-navy via-blue to-navy bg-clip-text text-transparent mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Main Content */}
        <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue" />
              Valor do Checkout
            </h2>
            <p className="text-sm text-muted-foreground">
              Defina o valor da taxa alfandegária
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor em Reais (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="214.80"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Este será o valor exibido no checkout
                </p>
              </div>

              <div className="p-4 bg-blue/10 rounded-lg border border-blue/20">
                <p className="text-sm text-navy">
                  <span className="font-semibold">Visualização:</span>
                  <span className="block text-2xl font-bold bg-gradient-to-r from-blue to-navy bg-clip-text text-transparent mt-2">
                    R$ {amount || "0.00"}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue to-blue/90 hover:from-blue/90 hover:to-blue shadow-blue transition-all duration-300 hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          )}
        </Card>

        {/* Payment Links Section */}
        <Card className="p-8 shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy mb-2 flex items-center gap-2">
              <Link2 className="h-6 w-6 text-blue" />
              Links de Pagamento Personalizados
            </h2>
            <p className="text-sm text-muted-foreground">
              Crie links únicos com valores específicos
            </p>
          </div>

          {/* Create New Link Form */}
          <div className="space-y-4 mb-8 p-6 bg-muted/30 rounded-lg border border-border/30">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Link
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newLinkAmount">Valor em Reais (R$)</Label>
                <Input
                  id="newLinkAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newLinkAmount}
                  onChange={(e) => setNewLinkAmount(e.target.value)}
                  placeholder="150.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newLinkDescription">Descrição (opcional)</Label>
                <Input
                  id="newLinkDescription"
                  type="text"
                  value={newLinkDescription}
                  onChange={(e) => setNewLinkDescription(e.target.value)}
                  placeholder="Ex: Taxa especial"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateLink}
              disabled={creatingLink}
              className="w-full md:w-auto"
            >
              {creatingLink ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Link
                </>
              )}
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Links List */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Criados</h3>
            {loadingLinks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue" />
              </div>
            ) : paymentLinks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum link criado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {paymentLinks.map((link) => (
                  <div 
                    key={link.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50 hover:border-blue/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold text-blue">
                          {link.code}
                        </code>
                        <span className="text-lg font-bold text-navy">
                          R$ {link.amount.toFixed(2)}
                        </span>
                      </div>
                      {link.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {link.description}
                        </p>
                      )}
                      <div className="mt-2 p-2 bg-muted/50 rounded border border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Link de pagamento:</p>
                        <code className="text-xs text-blue break-all">
                          {window.location.origin}/pagar/{link.code}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Acessos: {link.access_count} | Criado em: {new Date(link.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(link.code)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar Link
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
