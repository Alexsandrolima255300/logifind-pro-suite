import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { PEDIDOS, CARRIERS, STATUS_LABEL, BRL } from "@/lib/mock/data";

const suggestions = [
  "Quais pedidos estão atrasados?",
  "Quantos pedidos foram entregues hoje?",
  "Qual transportadora entrega mais rápido?",
  "Qual transportadora possui menor custo?",
];

function answer(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("atras")) {
    const atrasados = PEDIDOS.filter((p) => p.atrasado);
    if (!atrasados.length) return "Nenhum pedido atrasado no momento. Boa performance!";
    return `Encontrei ${atrasados.length} pedido(s) em atraso:\n\n${atrasados.map((p) => `• ${p.numero} — ${p.destinoCidade}/${p.destinoUf} · previsão ${p.previsao}`).join("\n")}`;
  }
  if (s.includes("entreg") && s.includes("hoje")) {
    const hoje = new Date().toISOString().slice(0, 10);
    const n = PEDIDOS.filter((p) => p.status === "entregue" && p.timeline.at(-1)?.data === hoje).length;
    const total = PEDIDOS.filter((p) => p.status === "entregue").length;
    return `Pedidos entregues hoje: ${n}. Total entregue no histórico: ${total}.`;
  }
  if (s.includes("rápid") || s.includes("rapid") || s.includes("prazo")) {
    const c = CARRIERS.slice().sort((a, b) => a.prazoMedio - b.prazoMedio)[0];
    return `A transportadora com menor prazo médio é ${c.nome} (${c.prazoMedio} dias úteis).`;
  }
  if (s.includes("bara") || s.includes("custo") || s.includes("menor")) {
    const c = CARRIERS.slice().sort((a, b) => a.valorPorKg - b.valorPorKg)[0];
    return `A transportadora com menor custo por kg é ${c.nome} (${BRL(c.valorPorKg)}/kg).`;
  }
  if (s.match(/ped[-_ ]?\d+/)) {
    const num = s.match(/\d+/)?.[0];
    const p = PEDIDOS.find((x) => x.numero === num);
    if (!p) return `Pedido ${num} não encontrado.`;
    return `Pedido ${p.numero}\nCliente: ${p.destinoCidade}/${p.destinoUf}\nStatus: ${STATUS_LABEL[p.status]}\nTransportadora: ${p.transportadora}\nPrevisão: ${p.previsao}`;
  }
  return "Posso ajudar com status de pedidos, transportadoras, prazos, custos e pedidos atrasados. Tente uma das sugestões abaixo.";
}

export function AIFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Olá! Sou o LogiFinder AI. Posso responder sobre pedidos, transportadoras, prazos e ocorrências." },
  ]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: answer(text) }]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-black shadow-[0_20px_60px_-15px_oklch(0.74_0.18_152/0.9)] hover:brightness-110 hover:scale-105 transition",
          open && "hidden",
        )}
        aria-label="Abrir LogiFinder AI"
      >
        <Sparkles className="h-6 w-6" strokeWidth={2.5} />
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none flex justify-end"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-strong flex h-full w-full max-w-md flex-col border-l border-white/[0.08] animate-in slide-in-from-right duration-300"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600">
                <Sparkles className="h-5 w-5 text-black" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">LogiFinder AI</div>
                <div className="text-[11px] text-primary/80">● online · assistente logístico</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/[0.06]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                    m.role === "user"
                      ? "ml-auto bg-primary/15 text-primary border border-primary/20"
                      : "mr-auto bg-white/[0.04] border border-white/[0.06]",
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte algo…"
                  className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm focus:outline-none focus:border-primary/50"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-black hover:brightness-110 transition"
                >
                  <Send className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
