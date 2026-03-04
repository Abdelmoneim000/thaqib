
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ClientLayout from "@/components/client-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Star, Briefcase, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FindAnalystsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useTranslation();

    const { data: analysts, isLoading } = useQuery<any[]>({
        queryKey: ["/api/public/analysts", searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            const res = await fetch(`/api/public/analysts?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch analysts");
            return res.json();
        },
        enabled: !!searchQuery.trim(),
    });

    const filteredAnalysts = analysts || [];

    return (
        <ClientLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("nav.find_analysts")}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t("find_analysts.discover_talent")}
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t("find_analysts.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isLoading && !!searchQuery.trim() ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !searchQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-xl border border-border/50 shadow-sm text-center px-4">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-6 border">
                            <Search className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">{t("find_analysts.initial_empty_title")}</h2>
                        <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                            {t("find_analysts.initial_empty_desc")}
                        </p>
                    </div>
                ) : filteredAnalysts.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">{t("find_analysts.no_analysts")}</h3>
                        <p className="mt-1">{t("find_analysts.adjust_search")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnalysts.map((analyst) => (
                            <Card key={analyst.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row gap-4 items-start pb-2">
                                    <Avatar className="h-16 w-16 border bg-muted">
                                        <AvatarImage src={analyst.profileImageUrl} />
                                        <AvatarFallback>{analyst.firstName?.[0]}{analyst.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg mt-1 truncate">
                                            {analyst.firstName} {analyst.lastName}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground truncate font-medium">
                                            {analyst.title || "Data Analyst"}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            <span className="font-medium">{analyst.rating?.toFixed(1) || "New"}</span>
                                            {analyst.reviewCount > 0 && (
                                                <span className="text-muted-foreground">({analyst.reviewCount})</span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {analyst.bio && (
                                        <CardDescription className="line-clamp-3 mb-4">
                                            {analyst.bio}
                                        </CardDescription>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {analyst.skills?.split(",").slice(0, 4).map((skill: string) => (
                                            <Badge key={skill} variant="secondary" className="text-xs font-normal">
                                                {skill.trim()}
                                            </Badge>
                                        ))}
                                        {analyst.skills?.split(",").length > 4 && (
                                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                                +{analyst.skills.split(",").length - 4} more
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Link href={`/analyst/public/${analyst.id}`} className="w-full">
                                        <Button variant="outline" className="w-full justify-between group">
                                            {t("common.view_profile")}
                                            <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
