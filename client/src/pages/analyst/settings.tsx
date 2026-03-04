import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Briefcase,
  Globe,
  Bell,
  Shield,
  X,
  ExternalLink,
  Loader2,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
interface AnalystStats {
  totalEarnings: number;
  completedProjects: number;
  activeProjects: number;
  totalProjects: number;
}

export default function AnalystSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState("");
  const { t } = useTranslation();

  // Parse skills from comma-separated string or array if stored differently
  const initialSkills = user?.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const [skills, setSkills] = useState<string[]>(initialSkills);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [title, setTitle] = useState(user?.title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isPublic, setIsPublic] = useState(user?.isPublic || false);

  const { data: stats } = useQuery<AnalystStats>({
    queryKey: ["/api/analyst/stats"],
    enabled: user?.role === "analyst",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName,
      lastName,
      title,
      bio,
      isPublic,
      skills: skills.join(","), // Store as comma-separated string if that's the established pattern
    });
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">{t("analyst_settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("analyst_settings.description")}
        </p>


        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("analyst_dashboard.total_earnings")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalEarnings?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t("analyst_dashboard.from_completed").replace("From completed projects", `From ${stats.completedProjects || 0} completed projects`)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("analyst_dashboard.active_projects")}
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("analyst_settings.profile_info")}
            </CardTitle>
            <CardDescription>
              {t("analyst_settings.profile_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("common.name")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("common.name")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                disabled
                className="bg-muted"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t("common.role")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Data Analyst"
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t("analyst_settings.profile_info")}</Label>
              <Textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("analyst_settings.share_experience")}
                data-testid="textarea-bio"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              {/** The button should move left when arabic translation is active */}
              <Switch
                id="public-profile"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="ml-2"
              />
              <Label htmlFor="public-profile">{t("analyst_settings.public_profile")}</Label>
              {isPublic && user && (
                <Link href={`/analyst/public/${user.id}`} className="ml-auto text-sm text-primary flex items-center hover:underline">
                  {t("analyst_settings.view_public_profile")} <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              )}
            </div>
            {isPublic && (
              <div>
                <Label>{t("analyst_settings.public_profile")}</Label>
                <p className="text-sm text-muted-foreground">{t("analyst_settings.public_desc")}</p>
              </div>
            )}
            <Button className="w-full md:w-auto mt-6" onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("settings.save_changes")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t("analyst_settings.skills_expertise")}
            </CardTitle>
            <CardDescription>
              {t("analyst_settings.skills_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pr-1">
                    {skill}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(skill)}
                      className="h-4 w-4 ml-1"
                      data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">{t("analyst_settings.no_skills")}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("analyst_settings.add_skill")}
                className="max-w-xs"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                data-testid="input-add-skill"
              />
              <Button type="button" onClick={handleAddSkill} variant="secondary" data-testid="button-add-skill">
                {t("analyst_settings.add_skill")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalystLayout>
  );
}
