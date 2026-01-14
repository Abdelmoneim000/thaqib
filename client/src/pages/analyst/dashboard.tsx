import AnalystLayout from "@/components/analyst-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Search, 
  FileText, 
  FolderKanban, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const stats = [
  {
    title: "Active Projects",
    value: "3",
    description: "Currently working on",
    icon: FolderKanban,
    trend: "+1 this week",
  },
  {
    title: "Pending Applications",
    value: "5",
    description: "Awaiting response",
    icon: FileText,
    trend: "2 new matches",
  },
  {
    title: "Earnings This Month",
    value: "$4,250",
    description: "From completed projects",
    icon: DollarSign,
    trend: "+15% from last month",
  },
  {
    title: "Completion Rate",
    value: "98%",
    description: "On-time delivery",
    icon: TrendingUp,
    trend: "Excellent rating",
  },
];

const recentProjects = [
  {
    id: "1",
    title: "Sales Performance Dashboard",
    client: "TechCorp Inc.",
    status: "in_progress",
    deadline: "Jan 25, 2026",
    budget: 2500,
  },
  {
    id: "2",
    title: "Customer Churn Analysis",
    client: "RetailMax",
    status: "in_progress",
    deadline: "Jan 30, 2026",
    budget: 1800,
  },
  {
    id: "3",
    title: "Marketing ROI Report",
    client: "GrowthLabs",
    status: "review",
    deadline: "Jan 18, 2026",
    budget: 1200,
  },
];

const recommendedProjects = [
  {
    id: "101",
    title: "Financial Forecasting Model",
    client: "FinanceFirst",
    budget: 3500,
    skills: ["Python", "ML", "Pandas"],
    applicants: 4,
  },
  {
    id: "102",
    title: "E-commerce Analytics Suite",
    client: "ShopNow",
    budget: 2800,
    skills: ["SQL", "Tableau", "ETL"],
    applicants: 7,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return <Badge variant="default">In Progress</Badge>;
    case "review":
      return <Badge variant="secondary">Under Review</Badge>;
    case "completed":
      return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AnalystDashboardPage() {
  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Sarah</h1>
          <p className="text-muted-foreground">
            Here's an overview of your analyst activity
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Projects you're currently working on</CardDescription>
              </div>
              <Link href="/analyst/projects">
                <Button variant="ghost" size="sm" data-testid="link-view-all-projects">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.client}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {project.deadline}
                        </div>
                        <div className="text-sm font-medium">${project.budget.toLocaleString()}</div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Projects matching your skills</CardDescription>
              </div>
              <Link href="/analyst/browse">
                <Button variant="ghost" size="sm" data-testid="link-browse-all">
                  Browse All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-3 rounded-md border space-y-3"
                    data-testid={`card-recommended-${project.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.client}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${project.budget.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.applicants} applicants
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" data-testid={`button-apply-${project.id}`}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/analyst/browse">
                <Button data-testid="button-find-projects">
                  <Search className="mr-2 h-4 w-4" />
                  Find New Projects
                </Button>
              </Link>
              <Link href="/analyst/applications">
                <Button variant="outline" data-testid="button-view-applications">
                  <FileText className="mr-2 h-4 w-4" />
                  View Applications
                </Button>
              </Link>
              <Link href="/analyst/projects">
                <Button variant="outline" data-testid="button-active-projects">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Active Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnalystLayout>
  );
}
