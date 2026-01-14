import { Link } from "wouter";
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
  CheckCircle2
} from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span 
              className="text-xl font-semibold tracking-tight cursor-pointer"
              data-testid="link-logo"
            >
              DataWork
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              data-testid="button-analysts"
            >
              Analysts
            </Button>
            <Button 
              variant="ghost" 
              className="text-muted-foreground"
              data-testid="button-projects"
            >
              Projects
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            data-testid="button-login"
          >
            Log in
          </Button>
          <Button 
            data-testid="button-register"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">The marketplace for data insights</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Connect with expert{" "}
            <span className="text-primary">data analysts</span>{" "}
            for your projects
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Post your data analysis projects, find skilled analysts, and get 
            actionable insights delivered as interactive dashboards.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" data-testid="button-post-project">
              Post a Project
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" data-testid="button-find-work">
              Find Work as Analyst
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
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
            Join thousands of organizations and analysts already using DataWork.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2"
              data-testid="button-cta-start"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
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
