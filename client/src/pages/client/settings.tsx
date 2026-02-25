import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import ClientLayout from "@/components/client-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ClientSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [organization, setOrganization] = useState(user?.organization || "");

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { firstName: string; lastName: string; organization: string }) => {
            const res = await apiRequest("PATCH", "/api/user", data);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({ title: t("settings.saved") });
        },
        onError: (error: Error) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({
            firstName,
            lastName,
            organization
        });
    };

    return (
        <ClientLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and profile
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{t("settings.profile")}</CardTitle>
                        <CardDescription>
                            Update your personal details and organization information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">{t("settings.first_name")}</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">{t("settings.last_name")}</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organization">{t("settings.organization")}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="organization"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        placeholder="Company Name"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ClientLayout>
    );
}
