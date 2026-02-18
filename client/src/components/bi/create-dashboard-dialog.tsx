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

            toast({ title: "Dashboard created", description: "You can now add visualizations." });
            if (setIsOpen) setIsOpen(false);
            setName("");
            setDescription("");
            if (onSuccess) onSuccess(data.id);
        },
        onError: () => {
            toast({ title: "Failed to create dashboard", variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!name) {
            toast({ title: "Name is required", variant: "destructive" });
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
                    <DialogTitle>Create New Dashboard</DialogTitle>
                    <DialogDescription>
                        {projectId && projectId !== "personal"
                            ? "Create a dashboard for this project."
                            : "Create a blank dashboard to add visualizations."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Dashboard Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Q1 Sales Report"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Description (optional)</Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the dashboard"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen && setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createDashboardMutation.isPending}>
                        {createDashboardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Dashboard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
