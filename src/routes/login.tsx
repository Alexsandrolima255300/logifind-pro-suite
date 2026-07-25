import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — LogiFinder" },
      { name: "description", content: "Acesse a plataforma LogiFinder e gerencie fretes, pedidos e transportadoras." },
      { property: "og:title", content: "Entrar — LogiFinder" },
      { property: "og:description", content: "Login seguro na plataforma LogiFinder TMS." },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("marcos@logifinder.io");
  const [senha, setSenha] = useState("");

  return (
    <div className="min-h-screen grid-noise flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-[0_20px_60px_-15px_oklch(0.74_0.18_152/0.8)]">
            <Package className="h-7 w-7 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Logi<span className="text-gradient-green">Finder</span></h1>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">TMS · Cotação Inteligente</p>
        </div>

        <div className="glass-strong rounded-3xl p-6 md:p-8 shadow-[0_40px_100px_-40px_oklch(0_0_0/0.8)]">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/90">
            <Sparkles className="h-3 w-3" /> BRASIL ENGRENAGENS E CORRENTES
          </div>
          <h2 className="mt-3 text-2xl font-bold">Acesse sua conta</h2>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" placeholder="••••••••"
                  className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-3 text-sm focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-primary" defaultChecked /> Lembrar de mim
              </label>
              <a className="text-primary hover:text-primary/80" href="#">Esqueci minha senha</a>
            </div>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 py-3 text-sm font-bold text-black shadow-[0_20px_60px_-20px_oklch(0.74_0.18_152/0.8)] hover:brightness-110 transition"
            >
              Entrar <ArrowRight className="h-4 w-4" />
            </Link>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.05] text-center text-xs text-muted-foreground">
            Não tem conta? <a className="text-primary" href="#">Solicitar acesso</a>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] text-muted-foreground">
          © 2026 LogiFinder · TMS · Cotação Inteligente
        </div>
      </div>
    </div>
  );
}
