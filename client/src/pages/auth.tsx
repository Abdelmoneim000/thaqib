import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  // If already logged in, redirect
  if (!isLoading && user) {
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "client") navigate("/client/projects");
    else navigate("/analyst/browse");
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
              <TabsTrigger value="login">{t("auth.login_tab")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.register_tab")}</TabsTrigger>
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
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({ title: t("common.required"), description: t("auth.required_email_phone"), variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: t("common.required"), description: t("auth.required_password"), variant: "destructive" });
      return;
    }

    try {
      await login({ email, password });
      toast({ title: t("auth.welcome_login"), description: t("auth.welcome_login_desc") });
    } catch (err: any) {
      toast({
        title: t("auth.login_failed"),
        description: err?.message?.includes("401") ? t("auth.invalid_credentials") : t("auth.generic_error"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("auth.welcome_back")}</CardTitle>
        <CardDescription>{t("auth.welcome_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">{t("auth.email_or_phone")}</Label>
            <Input
              id="login-email"
              type="text"
              placeholder={t("auth.email_or_phone_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">{t("auth.password")}</Label>
            <Input
              id="login-password"
              type="password"
              placeholder={t("auth.password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("auth.signing_in")}
              </>
            ) : (
              <>
                {t("auth.sign_in")} <ArrowRight className="w-4 h-4 ml-2" />
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
  const { t } = useTranslation();
  const [role, setRole] = useState<"client" | "analyst">("analyst");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [skills, setSkills] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missing: string[] = [];
    if (!firstName.trim()) missing.push(t("auth.first_name"));
    if (!lastName.trim()) missing.push(t("auth.last_name"));
    if (role === "client" && !phone.trim()) missing.push(t("auth.phone"));
    if (role === "analyst" && !email.trim()) missing.push(t("auth.email"));
    if (!password) missing.push(t("auth.password"));

    if (missing.length > 0) {
      toast({
        title: t("auth.required_missing"),
        description: `${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({ title: t("auth.password_short"), description: t("auth.password_short_desc"), variant: "destructive" });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: t("auth.terms_required"),
        description: t("auth.terms_required_desc"),
        variant: "destructive",
      });
      return;
    }

    try {
      // For clients: use email if provided, otherwise use phone directly as identifier
      // For analysts: use email as the identifier
      const identifier = role === "client" ? (email.trim() || phone.trim()) : email;

      await register({
        email: identifier,
        password,
        firstName,
        lastName,
        role,
        organization: role === "client" ? organization : undefined,
        skills: role === "analyst" ? skills : undefined,
        phone: role === "client" ? phone : undefined,
        termsAccepted,
      });
      toast({ title: t("auth.account_created"), description: t("auth.account_created_desc") });
    } catch (err: any) {
      toast({
        title: t("auth.register_failed"),
        description: err?.message?.includes("409") ? t("auth.register_duplicate") : t("auth.generic_error"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t("auth.create_account_title")}</CardTitle>
        <CardDescription>{t("auth.create_account_desc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>{t("auth.i_am_a")}</Label>
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
                <div className="font-semibold text-sm">{t("auth.role_client")}</div>
                <div className="text-xs text-muted-foreground">{t("auth.role_client_desc")}</div>
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
                <div className="font-semibold text-sm">{t("auth.role_analyst")}</div>
                <div className="text-xs text-muted-foreground">{t("auth.role_analyst_desc")}</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reg-first">{t("auth.first_name")} <span className="text-red-500">*</span></Label>
              <Input id="reg-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-last">{t("auth.last_name")} <span className="text-red-500">*</span></Label>
              <Input id="reg-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11" />
            </div>
          </div>

          {role === "client" ? (
            <div className="space-y-2">
              <Label htmlFor="reg-phone">{t("auth.phone")} <span className="text-red-500">*</span></Label>
              <Input id="reg-phone" type="tel" placeholder="+966 5XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="reg-email">{t("auth.email")} <span className="text-red-500">*</span></Label>
              <Input id="reg-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reg-password">{t("auth.password")} <span className="text-red-500">*</span></Label>
            <Input id="reg-password" type="password" placeholder={t("auth.min_chars")} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
          </div>

          {role === "client" && (
            <div className="space-y-2">
              <Label htmlFor="reg-org">{t("auth.organization")} <span className="text-muted-foreground text-xs">({t("auth.organization_optional")})</span></Label>
              <Input id="reg-org" placeholder={t("auth.organization_placeholder")} value={organization} onChange={(e) => setOrganization(e.target.value)} className="h-11" />
            </div>
          )}

          {role === "analyst" && (
            <div className="space-y-2">
              <Label htmlFor="reg-skills">{t("auth.skills")} <span className="text-muted-foreground text-xs">({t("auth.skills_optional")})</span></Label>
              <Input id="reg-skills" placeholder={t("auth.skills_placeholder")} value={skills} onChange={(e) => setSkills(e.target.value)} className="h-11" />
            </div>
          )}

          {/* Terms & Privacy */}
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
              {t("auth.terms_agree")}{" "}
              <Link href="/terms" className="text-blue-600 hover:underline font-medium" target="_blank">
                {t("auth.terms_link")}
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("auth.creating_account")}
              </>
            ) : (
              <>
                {t("auth.register")} <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
