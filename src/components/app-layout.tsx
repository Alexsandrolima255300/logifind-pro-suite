import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, BookOpen, Building2, ChevronLeft, FileText, LayoutDashboard, MapPin, Menu, Package, Radar, Search, Settings, ShoppingCart, Truck, UserCircle, Users, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIFab } from "./ai-fab";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cotacao", label: "Nova Cotação", icon: Search },
  { to: "/transportadoras", label: "Transportadoras", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/cidades", label: "Cidades", icon: MapPin },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/rastreamento", label: "Rastreamento", icon: Radar },
  { to: "/historico", label: "Histórico", icon: FileText },
  { to: "/relatorios", label: "Diretoria", icon: BarChart3 },
  { to: "/vendedor", label: "Painel do Vendedor", icon: Zap },
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
  const activeItem = nav.find((item) => pathname === item.to) ?? nav.find((item) => item.to !== "/" && pathname.startsWith(item.to));

  return (
    <div className="lf-shell min-h-screen w-full">
      {mobileOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("lf-sidebar fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300", collapsed ? "md:w-[82px]" : "md:w-[270px]", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0", "w-[280px]")}>
        <div className="flex h-[78px] items-center gap-3 border-b border-white/7 px-5">
          <div className="lf-logo"><Package className="h-5 w-5" /></div>
          <div className={cn("min-w-0", collapsed && "md:hidden")}>
            <div className="text-[17px] font-black tracking-tight">Logi<span className="text-primary">Finder</span></div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">TMS • Inteligência logística</div>
          </div>
          <button className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-white/5 md:hidden" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></button>
        </div>
        <div className={cn("px-4 pt-5", collapsed && "md:px-3")}>
          <div className={cn("mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground", collapsed && "md:hidden")}>Operação</div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
              const Icon = item.icon;
              return <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={cn("lf-nav-item", active && "active", collapsed && "md:justify-center md:px-0")}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className={cn(collapsed && "md:hidden")}>{item.label}</span>
              </Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto space-y-3 border-t border-white/7 p-4">
          <div className={cn("lf-user-card", collapsed && "md:justify-center md:p-2")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><UserCircle className="h-5 w-5" /></div>
            <div className={cn("min-w-0", collapsed && "md:hidden")}><p className="truncate text-sm font-semibold">Alexsandro</p><p className="text-[10px] text-muted-foreground">Administrador</p></div>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden w-full items-center justify-center gap-2 rounded-xl border border-white/7 py-2 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary md:flex"><ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />{!collapsed && "Recolher menu"}</button>
        </div>
      </aside>
      <div className={cn("min-h-screen transition-[padding] duration-300", collapsed ? "md:pl-[82px]" : "md:pl-[270px]")}>
        <header className="lf-topbar sticky top-0 z-30 flex h-[78px] items-center justify-between px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl border border-white/8 p-2.5 text-muted-foreground hover:text-primary md:hidden"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0"><p className="truncate text-xs font-medium text-muted-foreground">Você está em</p><h2 className="truncate text-base font-bold">{activeItem?.label ?? "Dashboard"}</h2></div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/cotacao" className="lf-top-action hidden sm:inline-flex"><Zap className="h-4 w-4 text-primary" /> Nova cotação</Link>
            <Link to="/notificacoes" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-muted-foreground hover:border-primary/30 hover:text-primary"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" /></Link>
            <Link to="/perfil" className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-1.5 pr-3 hover:border-primary/30"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><UserCircle className="h-4 w-4" /></span><span className="hidden text-xs font-semibold sm:block">Alexsandro</span></Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <AIFab />
    </div>
  );
}
