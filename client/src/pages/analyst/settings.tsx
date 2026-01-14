import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User,
  Mail,
  Briefcase,
  Globe,
  Bell,
  Shield,
  X
} from "lucide-react";

const skills = ["Python", "SQL", "Tableau", "Machine Learning", "Data Visualization", "Pandas"];

export default function AnalystSettingsPage() {
  return (
    <AnalystLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your public profile that clients will see
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  defaultValue="Sarah" 
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  defaultValue="Anderson" 
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="sarah@example.com" 
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input 
                id="title" 
                defaultValue="Senior Data Analyst" 
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                rows={4}
                defaultValue="Experienced data analyst with 5+ years in financial and e-commerce analytics. Specialized in Python, SQL, and creating actionable dashboards."
                data-testid="textarea-bio"
              />
            </div>
            <Button data-testid="button-save-profile">Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Skills
            </CardTitle>
            <CardDescription>
              Skills help clients find you for relevant projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="pr-1">
                  {skill}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1"
                    data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a skill..." 
                className="max-w-xs"
                data-testid="input-add-skill"
              />
              <Button variant="outline" data-testid="button-add-skill">Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New project matches</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when projects match your skills
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-project-matches">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Application updates</p>
                <p className="text-sm text-muted-foreground">
                  Updates on your project applications
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-app-updates">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Client messages</p>
                <p className="text-sm text-muted-foreground">
                  Notifications for new messages
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-messages">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" data-testid="button-change-password">
              Change Password
            </Button>
            <Button variant="outline" data-testid="button-enable-2fa">
              Enable Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnalystLayout>
  );
}
