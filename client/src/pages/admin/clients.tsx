import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderKanban,
  Database,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import type { User, Project, Dataset } from "@shared/schema";

interface ClientWithDetails extends User {
  projects?: Project[];
  datasets?: Dataset[];
}

export default function AdminClientsPage() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const { data: clients, isLoading: isLoadingClients } = useQuery<User[]>({
    queryKey: ["/api/users", "client"],
    queryFn: async () => {
      const res = await fetch("/api/users?role=client");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: datasets, isLoading: isLoadingDatasets } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
  });

  const getClientProjects = (clientId: string) => {
    return projects?.filter(p => p.clientId === clientId) || [];
  };

  const getClientDatasets = (clientId: string) => {
    const clientProjectIds = getClientProjects(clientId).map(p => p.id);
    return datasets?.filter(d => clientProjectIds.includes(d.projectId as string)) || [];
  };

  const selectedClientData = selectedClient ? clients?.find(c => c.id === selectedClient) : null;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Clients</h1>
          <p className="text-muted-foreground">Manage client accounts, projects, and datasets</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="card-clients-list">
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingClients ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : clients?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No clients yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients?.map((client) => (
                      <TableRow
                        key={client.id}
                        className={selectedClient === client.id ? "bg-muted" : ""}
                        data-testid={`row-client-${client.id}`}
                      >
                        <TableCell className="font-medium">
                          {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getClientProjects(client.id).length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedClient(client.id)}
                            data-testid={`button-view-client-${client.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-client-details">
            <CardHeader>
              <CardTitle>
                {selectedClientData
                  ? `${selectedClientData.firstName} ${selectedClientData.lastName}`
                  : "Select a Client"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedClient ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a client to view their details
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <FolderKanban className="h-4 w-4" />
                      Projects ({getClientProjects(selectedClient).length})
                    </h3>
                    {isLoadingProjects ? (
                      <Skeleton className="h-20 w-full" />
                    ) : getClientProjects(selectedClient).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No projects</p>
                    ) : (
                      <div className="space-y-2">
                        {getClientProjects(selectedClient).map(project => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-2 border rounded"
                            data-testid={`project-${project.id}`}
                          >
                            <span className="font-medium">{project.title}</span>
                            <Badge
                              variant={project.status === "completed" ? "default" : "secondary"}
                            >
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Database className="h-4 w-4" />
                      Datasets ({getClientDatasets(selectedClient).length})
                    </h3>
                    {isLoadingDatasets ? (
                      <Skeleton className="h-20 w-full" />
                    ) : getClientDatasets(selectedClient).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No datasets</p>
                    ) : (
                      <div className="space-y-2">
                        {getClientDatasets(selectedClient).map(dataset => (
                          <div
                            key={dataset.id}
                            className="flex items-center justify-between p-2 border rounded"
                            data-testid={`dataset-${dataset.id}`}
                          >
                            <span>{dataset.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {dataset.rowCount} rows
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    data-testid="button-chat-client"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
