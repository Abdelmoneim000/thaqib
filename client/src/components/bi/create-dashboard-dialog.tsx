import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CreateDashboardDialogProps {
    projectId?: string;
    trigger?: React.ReactNode;
    onSuccess?: (dashboardId: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateDashboardDialog({
    projectId,
    trigger,
    onSuccess,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: CreateDashboardDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

    const createDashboardMutation = useMutation({
        mutationFn: async (data: { name: string; description: string; projectId?: string }) => {
            const res = await apiRequest("POST", "/api/dashboards", data);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: [`/api/dashboards?projectId=${projectId}`] });
            }

            toast({ title: t("dashboards.dashboard_created"), description: t("dashboards.add_visuals_now") });
            if (setIsOpen) setIsOpen(false);
            setName("");
            setDescription("");
            if (onSuccess) onSuccess(data.id);
        },
        onError: () => {
            toast({ title: t("dashboards.create_failed"), variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!name) {
            toast({ title: t("common.required"), variant: "destructive" });
            return;
        }
        createDashboardMutation.mutate({
            name,
            description,
            projectId: projectId === "personal" ? undefined : projectId,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Dashboard
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("bi.create_dashboard")}</DialogTitle>
                    <DialogDescription>
                        {projectId && projectId !== "personal"
                            ? t("bi.create_dashboard_desc.project")
                            : t("bi.create_dashboard_desc")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("bi.dashboard_name")}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("bi.dashboard_name_placeholder")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">{t("bi.dashboard_desc")}</Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("bi.dashboard_desc_placeholder")}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen && setIsOpen(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleCreate} disabled={createDashboardMutation.isPending}>
                        {createDashboardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("bi.create_dashboard")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
