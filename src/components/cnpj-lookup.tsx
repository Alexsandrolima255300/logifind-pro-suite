import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, CheckCircle2, AlertTriangle, WifiOff, Send, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCnpj, isValidCnpj, fetchCnpj, type CnpjCompany } from "@/lib/cnpj";

const EMPTY: CnpjCompany = {
  cnpj: "", razaoSocial: "", nomeFantasia: "", situacao: "", dataAbertura: "",
  naturezaJuridica: "", logradouro: "", numero: "", complemento: "", bairro: "",
  cidade: "", uf: "", cep: "",
};

type Status = "idle" | "loading" | "ok" | "not_found" | "unavailable";
type Role = "remetente" | "destinatario";

export function CompanyBlock({
  role,
  defaultCnpj = "",
  onCompanyChange,
}: {
  role: Role;
  defaultCnpj?: string;
  onCompanyChange?: (c: CnpjCompany) => void;
}) {
  const [cnpj, setCnpj] = useState(defaultCnpj ? formatCnpj(defaultCnpj) : "");
  const [company, setCompany] = useState<CnpjCompany>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const lastLookup = useRef("");

  const clean = cnpj.replace(/\D/g, "");
  const valid = isValidCnpj(clean);

  useEffect(() => {
    if (clean.length !== 14) { setStatus("idle"); lastLookup.current = ""; return; }
    if (!valid) { setStatus("idle"); return; }
    if (lastLookup.current === clean) return;
    lastLookup.current = clean;
    setStatus("loading");
    fetchCnpj(clean).then((r) => {
      if (r.status === "ok") {
        setCompany(r.data);
        setCnpj(r.data.cnpj);
        setStatus("ok");
        onCompanyChange?.(r.data);
      } else if (r.status === "not_found") {
        setStatus("not_found");
      } else {
        setStatus("unavailable");
      }
    });
  }, [clean, valid, onCompanyChange]);

  function update<K extends keyof CnpjCompany>(k: K, v: CnpjCompany[K]) {
    const next = { ...company, [k]: v };
    setCompany(next);
    onCompanyChange?.(next);
  }

  const showFields = status === "ok" || status === "not_found" || status === "unavailable";
  const isRem = role === "remetente";
  const Icon = isRem ? Send : PackageCheck;
  const title = isRem ? "Remetente" : "Destinatário";
  const accent = isRem ? "from-primary to-emerald-600" : "from-cyan-400 to-teal-600";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", accent)}>
          <Icon className="h-4 w-4 text-black" strokeWidth={2.5} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
          {title}
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Building2 className="h-3 w-3" /> CNPJ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">CNPJ</label>
          <div className="relative">
            <input
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
              className={cn(
                "w-full h-11 rounded-xl bg-white/[0.04] border px-3 pr-10 text-sm font-semibold focus:outline-none transition",
                clean.length === 14 && !valid
                  ? "border-yellow-500/40 focus:border-yellow-500/60"
                  : "border-white/[0.08] focus:border-primary/50",
              )}
            />
            {status === "loading" && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
            {status === "ok" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
          </div>
          <StatusHint status={status} invalid={clean.length === 14 && !valid} />
        </div>

        {showFields && (
          <>
            <F label="Razão Social" value={company.razaoSocial} onChange={(v) => update("razaoSocial", v)} className="md:col-span-2" />
            <F label="Nome Fantasia" value={company.nomeFantasia} onChange={(v) => update("nomeFantasia", v)} className="md:col-span-2" />
            <F label="CEP" value={company.cep} onChange={(v) => update("cep", v)} />
            <F label="Logradouro" value={company.logradouro} onChange={(v) => update("logradouro", v)} className="md:col-span-2" />
            <F label="Número" value={company.numero} onChange={(v) => update("numero", v)} />
            <F label="Complemento" value={company.complemento} onChange={(v) => update("complemento", v)} />
            <F label="Bairro" value={company.bairro} onChange={(v) => update("bairro", v)} />
            <F label="Cidade" value={company.cidade} onChange={(v) => update("cidade", v)} className="md:col-span-2" />
            <F label="UF" value={company.uf} onChange={(v) => update("uf", v.toUpperCase().slice(0, 2))} />
          </>
        )}
      </div>
    </div>
  );
}

function StatusHint({ status, invalid }: { status: Status; invalid: boolean }) {
  if (invalid) return <Hint tone="warn" icon={AlertTriangle} text="CNPJ inválido" />;
  if (status === "ok") return <Hint tone="ok" icon={CheckCircle2} text="Dados preenchidos automaticamente" />;
  if (status === "not_found") return <Hint tone="warn" icon={AlertTriangle} text="CNPJ não localizado — preencha manualmente" />;
  if (status === "unavailable") return <Hint tone="warn" icon={WifiOff} text="Serviço indisponível — preencha manualmente" />;
  return null;
}

function Hint({ tone, icon: Icon, text }: { tone: "ok" | "warn"; icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className={cn("mt-1 flex items-center gap-1 text-[10px]", tone === "ok" ? "text-primary" : "text-yellow-400")}>
      <Icon className="h-3 w-3" /> {text}
    </div>
  );
}

function F({
  label, value, onChange, type = "text", className,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50 transition"
      />
    </div>
  );
}

// Backward-compat alias (legacy import name)
export const CnpjLookup = (props: { onCompanyChange?: (c: CnpjCompany) => void }) => (
  <CompanyBlock role="destinatario" {...props} />
);
