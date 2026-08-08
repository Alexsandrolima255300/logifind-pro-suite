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
  ShoppingCart,
  Users,
  UserCircle,
  BarChart3,
  Radar,
  BadgeDollarSign,
  Building2,
  BookOpen,
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
  { to: "/documentacao", label: "Documentação", icon: BookOpen },
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
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_-4px_oklch(0.62_0.22_255/0.6)]">
            <Package className="h-5 w-5 text-white" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
          </div>
          <div className={cn("min-w-0 transition-opacity", collapsed && "md:opacity-0 md:pointer-events-none")}>
            <div className="text-[15px] font-bold tracking-tight leading-tight">
              Logi<span className="text-gradient-blue">Finder</span>
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
                    ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_oklch(1_0_0/0.05)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_oklch(0.62_0.22_255/0.8)]" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                <span className={cn("truncate transition-opacity", collapsed && "md:opacity-0 md:pointer-events-none md:w-0")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.05] shrink-0 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      <div className={cn("flex flex-1 flex-col transition-all duration-500 ease-out", collapsed ? "md:pl-[76px]" : "md:pl-[248px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-background/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-muted-foreground md:hidden"
            >
              <Package className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold tracking-tight">Painel Principal</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/notificacoes"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      <AIFab />
    </div>
  );
}
