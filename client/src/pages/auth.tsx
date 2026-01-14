import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  BarChart3,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

type UserRole = "client" | "analyst" | null;

function RoleSelector({ 
  selectedRole, 
  onSelect 
}: { 
  selectedRole: UserRole; 
  onSelect: (role: UserRole) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect("client")}
        className={`relative flex flex-col items-start gap-4 rounded-lg border p-6 text-left transition-colors hover-elevate ${
          selectedRole === "client" 
            ? "border-primary bg-primary/5" 
            : "border-card-border bg-card"
        }`}
        data-testid="button-role-client"
      >
        {selectedRole === "client" && (
          <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-primary" />
        )}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
          <Building2 className="h-6 w-6 text-chart-2" />
        </div>
        <div>
          <h3 className="font-medium">I'm a Client</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Post projects and hire data analysts
          </p>
        </div>
      </button>
      
      <button
        type="button"
        onClick={() => onSelect("analyst")}
        className={`relative flex flex-col items-start gap-4 rounded-lg border p-6 text-left transition-colors hover-elevate ${
          selectedRole === "analyst" 
            ? "border-primary bg-primary/5" 
            : "border-card-border bg-card"
        }`}
        data-testid="button-role-analyst"
      >
        {selectedRole === "analyst" && (
          <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-primary" />
        )}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
          <BarChart3 className="h-6 w-6 text-chart-3" />
        </div>
        <div>
          <h3 className="font-medium">I'm an Analyst</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Find projects and deliver insights
          </p>
        </div>
      </button>
    </div>
  );
}

function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [step, setStep] = useState<"role" | "details">("role");

  const handleContinue = () => {
    if (selectedRole) {
      setStep("details");
    }
  };

  const handleBack = () => {
    setStep("role");
  };

  if (step === "role") {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-medium">Choose your role</h2>
          <p className="text-sm text-muted-foreground">
            Select how you want to use DataWork
          </p>
        </div>
        <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />
        <Button 
          className="w-full" 
          disabled={!selectedRole}
          onClick={handleContinue}
          data-testid="button-continue-role"
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>
      
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          selectedRole === "client" ? "bg-chart-2/10" : "bg-chart-3/10"
        }`}>
          {selectedRole === "client" ? (
            <Building2 className="h-5 w-5 text-chart-2" />
          ) : (
            <BarChart3 className="h-5 w-5 text-chart-3" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {selectedRole === "client" ? "Client Account" : "Analyst Account"}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedRole === "client" 
              ? "Post projects and manage your organization" 
              : "Apply to projects and build dashboards"}
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="John Doe" 
            data-testid="input-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com" 
            data-testid="input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Create a password"
            data-testid="input-password"
          />
        </div>
        {selectedRole === "client" && (
          <div className="space-y-2">
            <Label htmlFor="organization">Organization Name</Label>
            <Input 
              id="organization" 
              placeholder="Acme Inc." 
              data-testid="input-organization"
            />
          </div>
        )}
        {selectedRole === "analyst" && (
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              placeholder="Python, SQL, Tableau, Machine Learning" 
              data-testid="input-skills"
            />
          </div>
        )}
        <Button type="submit" className="w-full" data-testid="button-create-account">
          Create Account
        </Button>
      </form>
    </div>
  );
}

function LoginForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input 
          id="login-email" 
          type="email" 
          placeholder="john@example.com" 
          data-testid="input-login-email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button 
            type="button"
            className="text-xs text-primary hover:underline"
            data-testid="button-forgot-password"
          >
            Forgot password?
          </button>
        </div>
        <Input 
          id="login-password" 
          type="password" 
          placeholder="Enter your password"
          data-testid="input-login-password"
        />
      </div>
      <Button type="submit" className="w-full" data-testid="button-login-submit">
        Log in
      </Button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/">
              <span 
                className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight cursor-pointer"
                data-testid="link-logo"
              >
                <Users className="h-7 w-7 text-primary" />
                DataWork
              </span>
            </Link>
          </div>
          
          <Card className="border-card-border bg-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="register" data-testid="tab-register">
                    Register
                  </TabsTrigger>
                  <TabsTrigger value="login" data-testid="tab-login">
                    Log in
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="text-foreground cursor-pointer hover:underline">Terms</span>
            {" "}and{" "}
            <span className="text-foreground cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
