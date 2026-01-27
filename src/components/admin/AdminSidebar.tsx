import { useLocation, useNavigate } from "react-router-dom";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Layout, 
  Megaphone, 
  Shield, 
  Settings,
  BarChart3,
  ArrowLeft,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const adminNavItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Templates",
    icon: Layout,
    path: "/admin/templates",
  },
  {
    title: "Promotions",
    icon: Megaphone,
    path: "/admin/promotions",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  {
    title: "Discount Codes",
    icon: Tag,
    path: "/admin/discounts",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">PeakDraft Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={`w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 mt-4 opacity-60">
          <img src={logo} alt="PeakDraft" className="h-6 w-6" />
          <span className="text-xs text-muted-foreground">PeakDraft Admin</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
