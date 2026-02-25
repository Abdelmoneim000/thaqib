import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Users,
  FileSpreadsheet,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Eye,
  UserCheck,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Ban
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/language-toggle";

function Header() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Thaqib
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
          ) : user ? (
            <>
              <Link href={
                user.role === "admin" ? "/admin/dashboard" :
                  user.role === "client" ? "/client/projects" : "/analyst/browse"
              }>
                <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/10" data-testid="button-dashboard">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <a href="/auth">
                <Button
                  variant="ghost"
                  className="text-blue-100 hover:text-white hover:bg-white/10"
                  data-testid="button-login"
                >
                  {t("auth.login")}
                </Button>
              </a>
              <a href="/auth">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  data-testid="button-register"
                >
                  {t("auth.get_started")}
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-24 md:pt-48 md:pb-32">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147,51,234,0.3) 0%, transparent 50%)' }} />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-blue-200 font-medium">Secure data analytics marketplace</span>
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl leading-tight">
            {t("landing.hero_title_1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{t("landing.hero_title_2")}</span>
          </h1>
          <p className="mb-12 text-xl text-blue-100/80 md:text-2xl max-w-2xl mx-auto leading-relaxed">
            {t("landing.hero_description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/auth">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 gap-2" data-testid="button-post-project">
                {t("landing.post_project")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <a href="/auth">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm" data-testid="button-find-work">
                {t("landing.browse_analysts")}
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-[100px]" />
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: ClipboardList,
      step: "1",
      title: t("landing.step1_title"),
      description: t("landing.step1_desc")
    },
    {
      icon: Users,
      step: "2",
      title: t("landing.step2_title"),
      description: t("landing.step2_desc")
    },
    {
      icon: UserCheck,
      step: "3",
      title: t("landing.step3_title"),
      description: t("landing.step3_desc")
    },
    {
      icon: LayoutDashboard,
      step: "4",
      title: t("landing.step4_title"),
      description: t("landing.step4_desc")
    }
  ];

  return (
    <section className="border-t bg-card/50 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">
            {t("landing.how_it_works")}
          </h2>
          <p className="text-muted-foreground">
            From project creation to dashboard delivery in four steps
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={index} className="border-card-border bg-card relative">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight">
              {t("landing.about_title")}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>{t("landing.about_p1")}</p>
              <p>{t("landing.about_p2")}</p>
              <p>{t("landing.about_p3")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-card-border bg-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <p className="text-sm text-muted-foreground">{t("landing.about_stat1")}</p>
              </CardContent>
            </Card>
            <Card className="border-card-border bg-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{t("nav.dashboard").split(' ')[0]}</div>
                <p className="text-sm text-muted-foreground">{t("landing.about_stat2")}</p>
              </CardContent>
            </Card>
            <Card className="border-card-border bg-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">No</div>
                <p className="text-sm text-muted-foreground">{t("landing.about_stat3")}</p>
              </CardContent>
            </Card>
            <Card className="border-card-border bg-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">Role</div>
                <p className="text-sm text-muted-foreground">{t("landing.about_stat4")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const { t } = useTranslation();

  const features = [
    { icon: Ban, title: t("landing.sec1_title"), description: t("landing.sec1_desc") },
    { icon: ShieldCheck, title: t("landing.sec2_title"), description: t("landing.sec2_desc") },
    { icon: Lock, title: t("landing.sec3_title"), description: t("landing.sec3_desc") },
    { icon: UserCheck, title: t("landing.sec4_title"), description: t("landing.sec4_desc") },
    { icon: Eye, title: t("landing.sec5_title"), description: t("landing.sec5_desc") },
    { icon: Shield, title: t("landing.sec6_title"), description: t("landing.sec6_desc") }
  ];

  return (
    <section className="border-t bg-card/50 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">
            {t("landing.security_title")}
          </h2>
          <p className="text-muted-foreground">
            {t("landing.security_desc")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-card-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast({ title: t("landing.contact_required"), variant: "destructive" });
      return;
    }
    toast({ title: t("landing.contact_sent"), description: t("landing.contact_sent_desc") });
    setContactName("");
    setContactEmail("");
    setContactSubject("");
    setContactMessage("");
  };

  return (
    <section className="py-20" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight">
              {t("landing.contact_title")}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {t("landing.contact_desc")}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t("landing.contact_email")}</p>
                  <p className="text-sm text-muted-foreground">support@thaqib.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t("landing.contact_phone")}</p>
                  <p className="text-sm text-muted-foreground">+966 XX XXX XXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t("landing.contact_location")}</p>
                  <p className="text-sm text-muted-foreground">{t("landing.contact_location_value")}</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="border-card-border bg-card">
            <CardContent className="p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">{t("landing.contact_name")} <span className="text-red-500">*</span></Label>
                    <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={t("landing.contact_name_placeholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">{t("landing.contact_email_label")} <span className="text-red-500">*</span></Label>
                    <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={t("landing.contact_email_placeholder")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">{t("landing.contact_subject")}</Label>
                  <Input id="contact-subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder={t("landing.contact_subject_placeholder")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">{t("landing.contact_message")} <span className="text-red-500">*</span></Label>
                  <Textarea id="contact-message" rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder={t("landing.contact_message_placeholder")} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {t("landing.contact_send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Thaqib. {t("landing.footer_rights")}
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="cursor-pointer hover:text-foreground">{t("landing.footer_privacy")}</Link>
            <Link href="/terms" className="cursor-pointer hover:text-foreground">{t("landing.footer_terms")}</Link>
            <a href="#contact" className="cursor-pointer hover:text-foreground">{t("landing.footer_contact")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <AboutSection />
        <SecuritySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
