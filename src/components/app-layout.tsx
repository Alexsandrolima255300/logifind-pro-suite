import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Bell, BookOpen, Building2, FileText, LayoutDashboard, MapPin, Menu, Package, Radar, Search, Settings, ShoppingCart, Truck, UserCircle, Users, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIFab } from "./ai-fab";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard }, { to: "/cotacao", label: "Nova Cotação", icon: Search },
  { to: "/transportadoras", label: "Transportadoras", icon: Truck }, { to: "/clientes", label: "Clientes", icon: Building2 },
  { to: "/cidades", label: "Cidades", icon: MapPin }, { to: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/rastreamento", label: "Rastreamento", icon: Radar }, { to: "/historico", label: "Histórico", icon: FileText },
  { to: "/relatorios", label: "Diretoria", icon: BarChart3 }, { to: "/vendedor", label: "Painel do Vendedor", icon: Zap },
  { to: "/notificacoes", label: "Notificações", icon: Bell }, { to: "/usuarios", label: "Usuários", icon: Users },
  { to: "/configuracoes", label: "Configurações", icon: Settings }, { to: "/documentacao", label: "Documentação", icon: BookOpen },
  { to: "/perfil", label: "Meu Perfil", icon: UserCircle },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeItem = nav.find((item) => pathname === item.to) ?? nav.find((item) => item.to !== "/" && pathname.startsWith(item.to));

  const revealSidebar = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setSidebarOpen(true); };
  const hideSidebar = () => {
    if (mobileOpen) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSidebarOpen(false), 450);
  };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <div className="lf-shell min-h-screen w-full">
      <div className="fixed inset-y-0 left-0 z-[60] hidden w-6 md:block" onMouseEnter={revealSidebar} aria-hidden="true" />
      {mobileOpen && <button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside
        onMouseEnter={revealSidebar}
        onMouseLeave={hideSidebar}
        className={cn(
          "lf-sidebar fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/7 transition-transform duration-300 ease-out",
          (sidebarOpen || mobileOpen) ? "translate-x-0" : "-translate-x-[calc(100%-24px)]",
          mobileOpen && "w-[280px]"
        )}
      >
        <div className="flex h-[78px] shrink-0 items-center gap-3 border-b border-white/7 px-5">
          <div className="lf-logo"><Package className="h-5 w-5" /></div>
          <div className="min-w-0"><div className="text-[17px] font-black tracking-tight">Logi<span className="text-primary">Finder</span></div><div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">TMS • Inteligência logística</div></div>
          <button className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-white/5 md:hidden" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.18)_transparent]">
          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Operação</div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
              const Icon = item.icon;
              return <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={cn("lf-nav-item", active && "active")}><Icon className="h-[18px] w-[18px] shrink-0" /><span>{item.label}</span></Link>;
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/7 p-4"><div className="lf-user-card"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"><UserCircle className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">Alexsandro</p><p className="text-[10px] text-muted-foreground">Administrador</p></div></div></div>

        <button type="button" aria-label={sidebarOpen ? "Esconder menu lateral" : "Abrir menu lateral"} title={sidebarOpen ? "Esconder menu" : "Abrir menu"} onClick={() => setSidebarOpen((open) => !open)} className={cn("absolute -right-4 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-background/95 text-muted-foreground shadow-xl transition-all hover:border-primary/40 hover:text-primary md:flex", sidebarOpen && "rotate-180")}><ArrowRight className="h-4 w-4" /></button>
      </aside>

      <div className="min-h-screen">
        <header className="lf-topbar sticky top-0 z-30 flex h-[78px] items-center justify-between px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-xl border border-white/8 p-2.5 text-muted-foreground hover:text-primary md:hidden"><Menu className="h-5 w-5" /></button><div className="min-w-0"><p className="truncate text-xs font-medium text-muted-foreground">Você está em</p><h2 className="truncate text-base font-bold">{activeItem?.label ?? "Dashboard"}</h2></div></div>
          <div className="flex items-center gap-2 md:gap-3"><Link to="/cotacao" className="lf-top-action hidden sm:inline-flex"><Zap className="h-4 w-4 text-primary" /> Nova cotação</Link><Link to="/notificacoes" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-muted-foreground hover:border-primary/30 hover:text-primary"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" /></Link><Link to="/perfil" className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-1.5 pr-3 hover:border-primary/30"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><UserCircle className="h-4 w-4" /></span><span className="hidden text-xs font-semibold sm:block">Alexsandro</span></Link></div>
        </header>
        <main className="mx-auto w-full max-w-[1540px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <AIFab />
    </div>
  );
}
