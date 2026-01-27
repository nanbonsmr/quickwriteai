import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [serverVerifiedAdmin, setServerVerifiedAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user?.id || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'check-admin',
            userId: user.id,
            userEmail: user.email
          }
        });

        if (!error && data?.isAdmin) {
          setServerVerifiedAdmin(true);
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
      }
      setLoading(false);
    };

    if (isAdmin && user) {
      verifyAdmin();
    } else {
      setLoading(false);
    }
  }, [isAdmin, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !serverVerifiedAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have admin privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="font-semibold text-sm sm:text-base truncate">Admin Dashboard</span>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
