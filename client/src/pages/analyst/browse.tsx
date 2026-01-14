import { useState } from "react";
import { Link } from "wouter";
import AnalystLayout from "@/components/analyst-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Calendar, 
  DollarSign,
  Users,
  Building2,
  Clock,
  Filter,
  FileSpreadsheet
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  client: string;
  budget: number;
  deadline: string;
  postedDate: string;
  skills: string[];
  applicants: number;
  datasets: number;
  category: string;
}

const allProjects: Project[] = [
  {
    id: "101",
    title: "Financial Forecasting Model",
    description: "Build a comprehensive financial forecasting model using historical data. Need predictive analytics for revenue, expenses, and cash flow projections for the next 12 months.",
    client: "FinanceFirst Corp",
    budget: 3500,
    deadline: "Feb 15, 2026",
    postedDate: "2 days ago",
    skills: ["Python", "Machine Learning", "Pandas", "Financial Analysis"],
    applicants: 4,
    datasets: 3,
    category: "Finance",
  },
  {
    id: "102",
    title: "E-commerce Analytics Suite",
    description: "Create an analytics dashboard for our e-commerce platform. Track sales, customer behavior, inventory turnover, and marketing campaign effectiveness.",
    client: "ShopNow Inc",
    budget: 2800,
    deadline: "Feb 20, 2026",
    postedDate: "3 days ago",
    skills: ["SQL", "Tableau", "ETL", "Power BI"],
    applicants: 7,
    datasets: 5,
    category: "E-commerce",
  },
  {
    id: "103",
    title: "Customer Segmentation Analysis",
    description: "Segment our customer base using clustering algorithms. Identify key customer personas and provide actionable insights for targeted marketing.",
    client: "MarketPro",
    budget: 2200,
    deadline: "Feb 10, 2026",
    postedDate: "1 day ago",
    skills: ["Python", "Clustering", "Data Visualization", "Marketing Analytics"],
    applicants: 5,
    datasets: 2,
    category: "Marketing",
  },
  {
    id: "104",
    title: "Supply Chain Optimization Dashboard",
    description: "Develop a real-time dashboard to monitor and optimize supply chain operations. Include inventory levels, lead times, and supplier performance metrics.",
    client: "LogiTech Solutions",
    budget: 4000,
    deadline: "Mar 1, 2026",
    postedDate: "4 days ago",
    skills: ["SQL", "Python", "Tableau", "Supply Chain"],
    applicants: 3,
    datasets: 6,
    category: "Operations",
  },
  {
    id: "105",
    title: "Healthcare Data Analysis",
    description: "Analyze patient outcome data to identify trends and risk factors. Create visualizations for medical staff to improve patient care decisions.",
    client: "MedData Health",
    budget: 5000,
    deadline: "Mar 15, 2026",
    postedDate: "1 week ago",
    skills: ["R", "Statistical Analysis", "Healthcare", "Data Privacy"],
    applicants: 2,
    datasets: 4,
    category: "Healthcare",
  },
  {
    id: "106",
    title: "Social Media Sentiment Analysis",
    description: "Build a sentiment analysis pipeline for our social media channels. Track brand perception and competitor analysis across platforms.",
    client: "BrandWatch Agency",
    budget: 1800,
    deadline: "Feb 5, 2026",
    postedDate: "5 days ago",
    skills: ["NLP", "Python", "Text Mining", "Social Media"],
    applicants: 8,
    datasets: 1,
    category: "Marketing",
  },
];

const categories = ["All Categories", "Finance", "E-commerce", "Marketing", "Operations", "Healthcare"];
const budgetRanges = ["Any Budget", "$0 - $2,000", "$2,000 - $4,000", "$4,000+"];

export default function BrowseProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBudget, setSelectedBudget] = useState("Any Budget");
  const [applyingTo, setApplyingTo] = useState<Project | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "All Categories" || project.category === selectedCategory;
    
    let matchesBudget = true;
    if (selectedBudget === "$0 - $2,000") {
      matchesBudget = project.budget <= 2000;
    } else if (selectedBudget === "$2,000 - $4,000") {
      matchesBudget = project.budget > 2000 && project.budget <= 4000;
    } else if (selectedBudget === "$4,000+") {
      matchesBudget = project.budget > 4000;
    }

    return matchesSearch && matchesCategory && matchesBudget;
  });

  const handleApply = () => {
    setApplyingTo(null);
    setCoverLetter("");
    setProposedRate("");
  };

  return (
    <AnalystLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Browse Projects</h1>
          <p className="text-muted-foreground">
            Find data analysis projects that match your skills
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-projects"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                  <SelectTrigger className="w-[160px]" data-testid="select-budget">
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} projects
          </p>
        </div>

        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} data-testid={`card-project-${project.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {project.client}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${project.budget.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Fixed Price</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{project.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {project.deadline}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted {project.postedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {project.applicants} applicants
                  </div>
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet className="h-4 w-4" />
                    {project.datasets} datasets
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    data-testid={`button-view-details-${project.id}`}
                  >
                    View Details
                  </Button>
                  <Dialog open={applyingTo?.id === project.id} onOpenChange={(open) => !open && setApplyingTo(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setApplyingTo(project)}
                        data-testid={`button-apply-${project.id}`}
                      >
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Apply to Project</DialogTitle>
                        <DialogDescription>
                          Submit your application for "{project.title}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="rate">Your Proposed Rate</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="rate"
                              placeholder={project.budget.toString()}
                              value={proposedRate}
                              onChange={(e) => setProposedRate(e.target.value)}
                              className="pl-10"
                              data-testid="input-proposed-rate"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Client's budget: ${project.budget.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cover">Cover Letter</Label>
                          <Textarea
                            id="cover"
                            placeholder="Explain why you're the best fit for this project..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={6}
                            data-testid="textarea-cover-letter"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setApplyingTo(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleApply} data-testid="button-submit-application">
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or filters to find more projects
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnalystLayout>
  );
}
