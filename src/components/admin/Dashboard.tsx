import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, Eye, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  total_links: number;
  total_visits: number;
  total_payments: number;
  pending_payments: number;
  confirmed_payments: number;
  total_amount_pending: number;
  total_amount_confirmed: number;
  recent_payments: Array<{
    id: string;
    amount: number;
    status: string;
    customer_name: string;
    created_at: string;
  }>;
}

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        _user_id: userId
      });

      if (error) throw error;

      setStats(data as unknown as DashboardStats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/10 text-gray-700 hover:bg-gray-500/20"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">Nenhum dado disponível</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue/5 to-blue/10 border-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Links Ativos</p>
              <p className="text-3xl font-bold text-navy mt-2">{stats.total_links}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow/5 to-yellow/10 border-yellow/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Visitas</p>
              <p className="text-3xl font-bold text-navy mt-2">{stats.total_visits}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow/20 flex items-center justify-center">
              <Eye className="h-6 w-6 text-yellow" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{stats.confirmed_payments}</p>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {stats.total_amount_confirmed.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-3xl font-bold text-orange-700 mt-2">{stats.pending_payments}</p>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {stats.total_amount_pending.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pagamentos Recentes */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-navy flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue" />
            Pagamentos Recentes
          </h3>
          <p className="text-sm text-muted-foreground">Últimos 10 pagamentos</p>
        </div>

        {stats.recent_payments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum pagamento ainda</p>
        ) : (
          <div className="space-y-3">
            {stats.recent_payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{payment.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-navy">R$ {payment.amount.toFixed(2)}</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
