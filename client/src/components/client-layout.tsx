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
import { useTranslation } from "react-i18next";

const menuItemDefs = [
  { titleKey: "nav.my_projects", url: "/client/projects", icon: FolderKanban },
  { titleKey: "nav.chats", url: "/client/chats", icon: MessageSquare },
  { titleKey: "nav.datasets", url: "/client/datasets", icon: FileSpreadsheet },
  { titleKey: "nav.settings", url: "/client/settings", icon: Settings },
  { titleKey: "nav.find_analysts", url: "/client/find-analysts", icon: Users },
];

function ClientSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const userName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <Sidebar className="border-r-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link href="/">
          <span
            className="flex items-center gap-2 text-lg font-bold cursor-pointer tracking-tight"
            data-testid="link-logo"
          >
            <div className="flex bg-blue-500 rounded-md p-1">
              <Users className="h-4 w-4 text-white" />
            </div>
            Thaqib
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-blue-200/60 font-medium">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{userName}</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItemDefs.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    className="text-blue-100 hover:bg-white/10 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white hover:translate-x-1 transition-all duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
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
              className="text-blue-200 hover:bg-red-500/20 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("nav.logout")}</span>
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
    "--primary": "217 91% 60%", // Blue
    "--primary-foreground": "0 0% 100%",
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
          <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
