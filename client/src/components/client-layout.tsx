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
  FolderKanban, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  Users,
  Building2,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const menuItems = [
  {
    title: "My Projects",
    url: "/client/projects",
    icon: FolderKanban,
  },
  {
    title: "Chats",
    url: "/client/chats",
    icon: MessageSquare,
  },
  {
    title: "Datasets",
    url: "/client/datasets",
    icon: FileSpreadsheet,
  },
  {
    title: "Settings",
    url: "/client/settings",
    icon: Settings,
  },
];

function ClientSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const userName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/">
          <span 
            className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
            data-testid="link-logo"
          >
            <Users className="h-5 w-5 text-primary" />
            DataWork
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{userName}</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                  >
                    <Link href={item.url}>
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
      <div className="mt-auto border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <ClientSidebar />
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
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
