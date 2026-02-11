import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  FileSpreadsheet,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <div
              className="flex items-center gap-2 cursor-pointer"
              data-testid="link-logo"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Thaqib
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-blue-100 hover:text-white hover:bg-white/10"
              data-testid="button-analysts"
            >
              Analysts
            </Button>
            <Button
              variant="ghost"
              className="text-blue-100 hover:text-white hover:bg-white/10"
              data-testid="button-projects"
            >
              Projects
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
          ) : user ? (
            <>
              <Link href={user.role === "client" ? "/client/projects" : "/analyst/dashboard"}>
                <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/10" data-testid="button-dashboard">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                Log out
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
                  Log in
                </Button>
              </a>
              <a href="/auth">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  data-testid="button-register"
                >
                  Get Started
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
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-24 md:pt-48 md:pb-32">
      {/* Radial gradient overlay matching Auth page */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(147,51,234,0.3) 0%, transparent 50%)' }} />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-blue-200 font-medium">The marketplace for data insights</span>
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl leading-tight">
            Connect with top <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Data Analysts</span>
          </h1>
          <p className="mb-12 text-xl text-blue-100/80 md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Post your data analysis projects, find expert analysts, and get actionable insights delivered through interactive dashboards.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/auth">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 gap-2" data-testid="button-post-project">
                Post a Project
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <a href="/auth">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm" data-testid="button-find-work">
                Find Work as Analyst
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-[100px]" />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: FileSpreadsheet,
      title: "Upload Your Data",
      description: "Securely upload datasets in CSV, Excel, or connect to your database directly."
    },
    {
      icon: Users,
      title: "Match with Analysts",
      description: "Review proposals from qualified data analysts and choose the best fit for your project."
    },
    {
      icon: BarChart3,
      title: "Get Dashboards",
      description: "Receive interactive, embeddable dashboards with actionable insights."
    }
  ];

  return (
    <section className="border-t bg-card/50 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground">
            From data to decisions in three simple steps
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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

function BenefitsSection() {
  const clientBenefits = [
    "Access vetted data analysts",
    "Secure dataset handling",
    "Interactive dashboard deliverables",
    "Fixed-price or hourly projects"
  ];

  const analystBenefits = [
    "Work on diverse data projects",
    "Set your own rates",
    "Build your portfolio",
    "Flexible remote work"
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-card-border bg-card">
            <CardContent className="p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Organizations</h3>
              <p className="mb-6 text-muted-foreground">
                Get data-driven insights without building an in-house analytics team.
              </p>
              <ul className="space-y-3">
                {clientBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-card-border bg-card">
            <CardContent className="p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">For Analysts</h3>
              <p className="mb-6 text-muted-foreground">
                Find meaningful data projects and showcase your analytical skills.
              </p>
              <ul className="space-y-3">
                {analystBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-chart-3" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="border-t bg-card/50 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">
            Enterprise-grade security
          </h2>
          <p className="mb-8 text-muted-foreground">
            Your data is protected with encryption at rest and in transit,
            role-based access controls, and complete audit logging.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              SOC 2 Compliant
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              GDPR Ready
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              256-bit Encryption
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-semibold text-primary-foreground md:text-3xl">
            Ready to unlock your data's potential?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Join thousands of organizations and analysts already using Thaqib.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                data-testid="button-cta-start"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">
            DataWork. Built for data teams.
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground">Privacy</span>
            <span className="cursor-pointer hover:text-foreground">Terms</span>
            <span className="cursor-pointer hover:text-foreground">Contact</span>
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
        <FeaturesSection />
        <BenefitsSection />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
