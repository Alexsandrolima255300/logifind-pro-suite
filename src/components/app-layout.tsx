import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  Truck,
  FileText,
  MapPin,
  Settings,
  ChevronLeft,
  Bell,
  Package,
  LogOut,
  ShoppingCart,
  Users,
  UserCircle,
  BarChart3,
  Radar,
  BadgeDollarSign,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIFab } from "./ai-fab";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cotacao", label: "Nova Cotação", icon: Search },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/rastreamento", label: "Rastreamento", icon: Radar },
  { to: "/vendedor", label: "Painel do Vendedor", icon: BadgeDollarSign },
  { to: "/transportadoras", label: "Transportadoras", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/cidades", label: "Cidades", icon: MapPin },
  { to: "/historico", label: "Histórico", icon: FileText },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/usuarios", label: "Usuários", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/perfil", label: "Meu Perfil", icon: UserCircle },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full text-foreground">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "glass-strong fixed z-50 flex h-screen flex-col border-r border-white/[0.06] transition-all duration-500 ease-out",
          collapsed ? "md:w-[76px]" : "md:w-[248px]",
          "w-[260px]",
          mobileOpen ? "left-0" : "-left-72 md:left-0",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.05] shrink-0">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-[0_0_20px_-4px_oklch(0.74_0.18_152/0.6)]">
            <Package className="h-5 w-5 text-black" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
          </div>
          <div className={cn("min-w-0 transition-opacity", collapsed && "md:opacity-0 md:pointer-events-none")}>
            <div className="text-[15px] font-bold tracking-tight leading-tight">
              Logi<span className="text-gradient-green">Finder</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">TMS · Cotação Inteligente</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item, i) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_oklch(1_0_0/0.05)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_oklch(0.74_0.18_152/0.8)]" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                <span className={cn("truncate transition-opacity", collapsed && "md:opacity-0 md:pointer-events-none md:w-0")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.05] p-3 space-y-2 shrink-0">
          <div className={cn("flex items-center gap-3 rounded-xl px-2 py-2", collapsed && "md:justify-center")}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-500/40 to-emerald-800/40 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              BEC
            </div>
            <div className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
              <div className="text-xs font-semibold truncate">BRASIL ENGRENAGENS E CORRENTES</div>
              <div className="text-[10px] text-muted-foreground truncate">Administrador</div>
            </div>
            <Link to="/login" className={cn("text-muted-foreground hover:text-foreground transition", collapsed && "md:hidden")}>
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", collapsed && "rotate-180")} />
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-500",
          collapsed ? "md:pl-[76px]" : "md:pl-[248px]",
        )}
      >
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 px-4 md:px-8 border-b border-white/[0.05]">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar pedidos, clientes, transportadoras…"
                className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition"
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2">
            <Link
              to="/notificacoes"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.74_0.18_152)]" />
            </Link>
            <Link
              to="/cotacao"
              className="hidden md:inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-4 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_oklch(0.74_0.18_152/0.6)] hover:brightness-110 transition"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} />
              Nova Cotação
            </Link>
          </div>
        </header>

        <main className="flex-1 grid-noise">{children}</main>
      </div>

      <AIFab />
    </div>
  );
}
