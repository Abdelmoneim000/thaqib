import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  LogOut,
  BarChart3,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    url: "/admin/clients",
    icon: Users,
  },
  {
    title: "Analysts",
    url: "/admin/analysts",
    icon: Briefcase,
  },
  {
    title: "Support Chats",
    url: "/admin/chats",
    icon: MessageSquare,
  },
];

function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <Sidebar className="border-r-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
      <SidebarHeader className="border-b border-white/10 p-4">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <div className="flex bg-emerald-500 rounded-md p-1">
            <Shield className="h-4 w-4 text-white" />
          </div>
          Admin Panel
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-emerald-200/60 font-medium">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Management</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || location.startsWith(item.url + "/")}
                    className="text-emerald-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-emerald-600 data-[active=true]:text-white hover:translate-x-1 transition-all duration-200"
                  >
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t border-white/10 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              data-testid="button-logout"
              className="text-emerald-200 hover:bg-red-500/20 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "AD";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
    "--primary": "160 84% 39%", // Emerald
    "--primary-foreground": "0 0% 100%",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Admin</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium" data-testid="avatar-user">
                {initials}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
