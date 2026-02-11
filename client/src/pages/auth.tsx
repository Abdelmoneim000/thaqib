import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, Briefcase, ArrowRight, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // If already logged in, redirect
  if (!isLoading && user) {
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "client") navigate("/client/projects");
    else navigate("/analyst/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147,51,234,0.3) 0%, transparent 50%)' }} />
        <div className="relative z-10">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              {/* SVG Logo placeholder — replace with actual logo */}
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Thaqib</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Data Analytics<br />
            <span className="text-blue-400">Marketplace</span>
          </h1>
          <p className="text-lg text-blue-200/80 max-w-md">
            Connect with top data analysts or find your next data project. Thaqib brings clients and analysts together.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Post Projects</h3>
                <p className="text-blue-200/60 text-sm">Upload datasets and find the right analyst for your business needs</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Expert Analysts</h3>
                <p className="text-blue-200/60 text-sm">Browse and apply to data projects that match your expertise</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Interactive Dashboards</h3>
                <p className="text-blue-200/60 text-sm">Build, visualize, and share data insights with powerful tools</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-blue-200/40 text-sm">
          © {new Date().getFullYear()} Thaqib. All rights reserved.
        </p>
      </div>

      {/* Right: Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Thaqib</span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message?.includes("401") ? "Invalid email or password" : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const { register, registerError, isRegistering } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<"client" | "analyst">("analyst");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        role,
        organization: role === "client" ? organization : undefined,
        skills: role === "analyst" ? skills : undefined,
      });
      toast({ title: "Account created!", description: "Welcome to Thaqib." });
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err?.message?.includes("409") ? "An account with this email already exists" : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Choose your role and fill in your details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 rounded-lg border-2 text-left transition-all ${role === "client"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setRole("client")}
              >
                <Briefcase className="w-5 h-5 mb-2" />
                <div className="font-semibold text-sm">Client</div>
                <div className="text-xs text-muted-foreground">Post projects & hire analysts</div>
              </button>
              <button
                type="button"
                className={`p-4 rounded-lg border-2 text-left transition-all ${role === "analyst"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setRole("analyst")}
              >
                <BarChart3 className="w-5 h-5 mb-2" />
                <div className="font-semibold text-sm">Analyst</div>
                <div className="text-xs text-muted-foreground">Find projects & build dashboards</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reg-first">First Name</Label>
              <Input id="reg-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-last">Last Name</Label>
              <Input id="reg-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
          </div>

          {role === "client" && (
            <div className="space-y-2">
              <Label htmlFor="reg-org">Organization</Label>
              <Input id="reg-org" placeholder="Company name" value={organization} onChange={(e) => setOrganization(e.target.value)} className="h-11" />
            </div>
          )}

          {role === "analyst" && (
            <div className="space-y-2">
              <Label htmlFor="reg-skills">Skills</Label>
              <Input id="reg-skills" placeholder="Python, SQL, Tableau, etc." value={skills} onChange={(e) => setSkills(e.target.value)} className="h-11" />
            </div>
          )}

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
