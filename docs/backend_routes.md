# Backend API Routes

## Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Register new user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

## Users
- `PATCH /api/user` - Update current user profile (firstName, lastName, organization, skills)
- `PATCH /api/auth/role` - Update user role (client/analyst)

## Projects
- `GET /api/projects` - List projects. Query params: `status` (open, etc.)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Applications
- `GET /api/applications` - List applications.
  - Query param `projectId`: Get applications for a project (Client/Admin view). Enriched with analyst info.
  - No param (Analyst role): Get analyst's own applications. Enriched with project info.
- `POST /api/applications` - Submit application. Body: `{ projectId, coverLetter, proposedBudget }`
- `PATCH /api/applications/:id` - Update application status. Body: `{ status: "accepted" | "rejected" }`. Accepting assigns analyst to project.

## Datasets
- `GET /api/datasets` - List datasets. Query param `projectId`. Enriched with project title.
- `POST /api/datasets` - Upload dataset. Multipart form data: `file` (csv), `projectId`.
- `DELETE /api/datasets/:id` - Delete dataset

## Dashboards & Visualizations
- `GET /api/dashboards` - List dashboards. Query param `projectId`.
- `GET /api/dashboards/:id` - Get specific dashboard
- `POST /api/dashboards` - Create dashboard
- `PATCH /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `GET /api/visualizations` - List visualizations for a dashboard. Query param `dashboardId`.
- `POST /api/visualizations` - Create visualization
- `PATCH /api/visualizations/:id` - Update visualization
- `DELETE /api/visualizations/:id` - Delete visualization
- `POST /api/query` - Execute query on dataset. Body: `{ datasetId, query }`. Returns data array.

## Shared Dashboards
- `POST /api/dashboards/:id/share` - Create share link for dashboard
- `GET /api/shared/:token` - Get shared dashboard by token (public access)

## Conversations (Chat)
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create or get existing conversation. Body: `{ otherUserId, analystName, projectId? }`
- `GET /api/conversations/:id/messages` - Get messages for conversation
- `POST /api/conversations/:id/messages` - Send message. Body: `{ content }`

## Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/conversations` - Get support conversations
