import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export function ImpersonationBanner() {
    const [, navigate] = useLocation();
    const { user } = useAuth();

    const stopMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/admin/stop-impersonation");
            return res.json();
        },
        onSuccess: () => {
            // Invalidate all queries to refresh everything
            queryClient.invalidateQueries();
            // Small delay to let the session update before navigating
            setTimeout(() => navigate("/admin/dashboard"), 100);
        },
    });

    // Check impersonation from user data (set by /api/auth/user)
    const isImpersonating = (user as any)?.isImpersonating;
    if (!isImpersonating) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950">
            <div className="container mx-auto flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                        Viewing as: <strong>{user?.firstName} {user?.lastName}</strong> ({user?.role})
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-700 bg-amber-600 text-white hover:bg-amber-700 gap-1"
                    onClick={() => stopMutation.mutate()}
                    disabled={stopMutation.isPending}
                >
                    <ArrowLeft className="h-3 w-3" />
                    Return to Admin
                </Button>
            </div>
        </div>
    );
}
