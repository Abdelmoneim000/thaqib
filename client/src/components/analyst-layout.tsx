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
  Search,
  FileText,
  FolderKanban,
  Settings,
  LogOut,
  BarChart3,
  User,
  PieChart,
  MessageSquare,
  UserCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function AnalystSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const userName = user?.firstName || user?.email?.split("@")[0] || "Analyst";

  const menuItems = [
    {
      title: "Dashboard",
      url: "/analyst/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Browse Projects",
      url: "/analyst/browse",
      icon: Search,
    },
    {
      title: "My Applications",
      url: "/analyst/applications",
      icon: FileText,
    },
    {
      title: "Active Projects",
      url: "/analyst/projects",
      icon: FolderKanban,
    },
    {
      title: "Chats",
      url: "/analyst/chats",
      icon: MessageSquare,
    },
    {
      title: "Datasets",
      url: "/analyst/datasets",
      icon: FileText,
    },
    {
      title: "BI Studio",
      url: "/analyst/dashboards",
      icon: PieChart,
    },
    {
      title: "My Profile",
      url: user ? `/analyst/public/${user.id}` : "#",
      icon: UserCircle,
    },
    {
      title: "Settings",
      url: "/analyst/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="border-r-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link href="/">
          <span
            className="flex items-center gap-2 text-lg font-bold cursor-pointer tracking-tight"
            data-testid="link-logo"
          >
            <div className="flex bg-purple-500 rounded-md p-1">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Thaqib
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-purple-200/60 font-medium">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "#" && location.startsWith(item.url + "/"))}
                    className="text-purple-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-purple-600 data-[active=true]:text-white hover:translate-x-1 transition-all duration-200"
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
              className="text-purple-200 hover:bg-red-500/20 hover:text-red-200"
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

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
    "--primary": "270 76% 53%", // Purple
    "--primary-foreground": "0 0% 100%",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AnalystSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
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
