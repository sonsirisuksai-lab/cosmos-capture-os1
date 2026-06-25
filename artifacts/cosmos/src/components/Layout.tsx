import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Rocket, 
  Terminal, 
  BookOpen, 
  Network, 
  User, 
  FolderOpen, 
  Clock,
  Menu,
  Activity,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/", label: "Command Center", icon: Rocket },
  { href: "/universe", label: "Universe OS", icon: Globe },
  { href: "/notes", label: "Knowledge Vault", icon: BookOpen },
  { href: "/maka", label: "Prompt Terminal", icon: Terminal },
  { href: "/graph", label: "Knowledge Galaxy", icon: Network },
  { href: "/twin", label: "Digital Twin", icon: User },
  { href: "/collections", label: "Star Collections", icon: FolderOpen },
  { href: "/timeline", label: "Event Stream", icon: Clock },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() }});

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/40 backdrop-blur-xl border-r border-white/5 py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center cosmic-glow shrink-0">
          <Rocket className="w-4 h-4 text-primary" />
        </div>
        <div className="font-mono font-bold text-lg tracking-wider text-white">COSMOS_OS</div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? "bg-primary/15 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "opacity-70"}`} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-primary cosmic-glow shrink-0" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="px-3 py-2 text-xs font-mono text-muted-foreground flex items-center justify-between">
          <span>SYS.STATUS:</span>
          <span className={`flex items-center gap-1.5 ${health?.status === 'ok' ? 'text-accent' : 'text-yellow-500'}`}>
            <Activity className="w-3 h-3" />
            {health?.status === 'ok' ? 'ONLINE' : 'SYNCING'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex w-full bg-background dark text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-lg z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="font-mono font-bold">COSMOS_OS</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-background/95 border-r-white/10 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 md:h-screen overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
