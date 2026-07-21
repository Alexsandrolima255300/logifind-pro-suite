import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { getPedido, getCliente, getCarrier, BRL } from "@/lib/mock/data";
import { ArrowLeft, Truck, User, Package as PackageIcon, MapPin, Calendar, Hash } from "lucide-react";

export const Route = createFileRoute("/pedidos/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Pedido #${params.id} — LogiFinder` },
      { name: "description", content: `Detalhes e timeline completa do pedido #${params.id}.` },
      { property: "og:title", content: `Pedido #${params.id} — LogiFinder` },
      { property: "og:description", content: "Timeline completa, rastreamento e ocorrências do pedido." },
    ],
  }),
  loader: ({ params }) => {
    const pedido = getPedido(params.id);
    if (!pedido) throw notFound();
    return { pedido };
  },
  notFoundComponent: () => (
    <AppLayout>
      <div className="p-8 text-center text-muted-foreground">Pedido não encontrado.</div>
    </AppLayout>
  ),
  component: PedidoDetalhe,
});

function PedidoDetalhe() {
  const { pedido } = Route.useLoaderData();
  const cliente = getCliente(pedido.clienteId);
  const carrier = getCarrier(pedido.transportadora);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1280px] p-4 md:p-8 space-y-6">
        <Link to="/pedidos" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para pedidos
        </Link>

        <PageHeader
          eyebrow={`Pedido #${pedido.numero} · ${carrier.nome}`}
          title={`${cliente?.nomeFantasia}`}
          description={`${pedido.origemCidade}/${pedido.origemUf} → ${pedido.destinoCidade}/${pedido.destinoUf} · previsão ${pedido.previsao}`}
          actions={<StatusBadge status={pedido.status} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <div className="text-sm font-semibold mb-5">Linha do tempo</div>
            <Timeline pedido={pedido} />
          </div>

          <div className="space-y-4">
            <InfoCard title="Cliente" icon={User}>
              <Row k="Empresa" v={cliente?.razaoSocial ?? "—"} />
              <Row k="CNPJ" v={cliente?.cnpj ?? "—"} />
              <Row k="Contato" v={cliente?.contato ?? "—"} />
              <Row k="Telefone" v={cliente?.telefone ?? "—"} />
            </InfoCard>

            <InfoCard title="Logística" icon={Truck}>
              <Row k="Transportadora" v={carrier.nome} />
              <Row k="Rastreio" v={pedido.codigoRastreio} mono />
              <Row k="Motorista" v={pedido.motorista} />
              <Row k="Veículo" v={pedido.veiculo} />
            </InfoCard>

            <InfoCard title="Carga" icon={PackageIcon}>
              <Row k="Volumes" v={`${pedido.volumes} un`} />
              <Row k="Peso" v={`${pedido.peso} kg`} />
              <Row k="Cubagem" v={`${pedido.cubagem} m³`} />
              <Row k="Valor NF-e" v={BRL(pedido.valor)} />
            </InfoCard>

            <InfoCard title="Datas" icon={Calendar}>
              <Row k="Data da venda" v={pedido.dataVenda} />
              <Row k="Previsão" v={pedido.previsao} />
            </InfoCard>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Hash className="h-4 w-4 text-primary" /> Produtos
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pedido.produtos.map((p: { descricao: string; qtd: number }, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                    {p.qtd}
                  </div>
                  <span>{p.descricao}</span>
                </div>
                <span className="text-muted-foreground">{p.qtd} un</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <MapPin className="h-4 w-4" /> Rota da entrega
          </div>
          <div className="text-muted-foreground">
            {pedido.origemCidade}, {pedido.origemUf} → {pedido.destinoCidade}, {pedido.destinoUf}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={mono ? "font-mono text-primary" : "font-medium text-right"}>{v}</dd>
    </div>
  );
}
