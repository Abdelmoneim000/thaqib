import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, MapPin, Briefcase, Star, LayoutDashboard, Calendar, Award } from "lucide-react";
import { Dashboard } from "@shared/schema";
import { Link } from "wouter";

interface PublicAnalystProfile {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    skills: string;
    profileImageUrl: string;
    dashboards: Dashboard[];
    projects: any[];
    ratings: any[];
}

export default function PublicProfilePage() {
    const [, params] = useRoute("/analyst/public/:id");
    const analystId = params?.id;
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    const { data: profile, isLoading, error } = useQuery<PublicAnalystProfile>({
        queryKey: [`/api/public/analysts/${analystId}`],
        enabled: !!analystId,
    });

    const contactMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/conversations", {
                otherUserId: analystId,
                projectId: null // General inquiry
            });
            return res.json();
        },
        onSuccess: (conversation) => {
            // Redirect to chat with this conversation selected
            // Depending on user role, route might differ (client/chats vs analyst/chats)
            // But usually this page is viewed by clients.
            const chatPath = user?.role === "client" ? "/client/chats" : "/analyst/chats";
            setLocation(`${chatPath}?conversationId=${conversation.id}`);
        },
    });

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-muted-foreground">This analyst profile is either private or does not exist.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`;

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Hero Section */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-sm">
                            <AvatarImage src={profile.profileImageUrl} />
                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h1>
                                <p className="text-xl text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="h-5 w-5" />
                                    {profile.title || "Data Analyst"}
                                </p>
                            </div>

                            {profile.bio && (
                                <p className="max-w-2xl text-base leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.split(",").map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-background border shadow-sm">
                                        {skill.trim()}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                {user && user.id !== analystId && user.role === "client" && (
                                    <Button
                                        size="lg"
                                        onClick={() => contactMutation.mutate()}
                                        disabled={contactMutation.isPending}
                                    >
                                        {contactMutation.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Mail className="mr-2 h-4 w-4" />
                                        )}
                                        Contact Analyst
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="showcase" className="space-y-8">
                    <TabsList>
                        <TabsTrigger value="showcase">Showcase</TabsTrigger>
                        <TabsTrigger value="projects">Track Record</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="showcase" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {profile.dashboards && profile.dashboards.length > 0 ? (
                                profile.dashboards.map((dashboard: Dashboard) => (
                                    <Link key={dashboard.id} href={`/analyst/dashboard/${dashboard.id}?viewOnly=true`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center justify-between">
                                                    {dashboard.name}
                                                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 text-xs font-normal">
                                                        <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Featured
                                                    </Badge>
                                                </CardTitle>
                                                {dashboard.description && (
                                                    <CardDescription className="line-clamp-2 mt-1">
                                                        {dashboard.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="mt-auto pt-4">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        {dashboard.layout?.items?.length || 0} charts
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(dashboard.updatedAt!).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <Star className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No showcased dashboards yet.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-6">
                        <div className="grid gap-4">
                            {profile.projects && profile.projects.length > 0 ? (
                                profile.projects.map((project: any, i: number) => (
                                    <Card key={i}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{project.title}</CardTitle>
                                            <CardDescription>{project.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No completed projects visible yet.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews">
                        <div className="space-y-4">
                            {profile.ratings && profile.ratings.length > 0 ? (
                                profile.ratings.map((rating: any) => (
                                    <Card key={rating.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < rating.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                                                    ))}
                                                </div>
                                                <span className="font-semibold">{rating.rating.toFixed(1)}</span>
                                            </div>
                                            <p className="text-sm italic">"{rating.comment || "No comment"}"</p>
                                            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                                                <Award className="h-3 w-3" />
                                                Verified Review
                                                <span className="mx-1">•</span>
                                                {new Date(rating.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>No reviews yet.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
