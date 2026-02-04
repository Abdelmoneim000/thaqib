# DataWork - Freelance Data Analytics Marketplace

## Overview

DataWork is a two-sided marketplace connecting businesses (clients) with data analysts. Clients can post analytics projects, upload datasets, and hire analysts. Analysts can browse available projects, submit applications, manage active work, and deliver dashboards/insights.

The application follows a full-stack TypeScript architecture with React frontend and Express backend, designed for enterprise data-heavy workflows with white-label flexibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Design System**: Carbon Design System principles (IBM Plex fonts, enterprise-focused data visualization patterns)
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **Build**: esbuild for production bundling with selective dependency bundling for cold start optimization

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Drizzle Kit with `db:push` command

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components (client/, analyst/)
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer interface
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle database schema
```

### Key Design Decisions

**Monorepo with Shared Types**: The `shared/` directory contains Drizzle schemas that generate both database tables and TypeScript types, ensuring type safety across the full stack.

**Storage Interface Pattern**: `server/storage.ts` defines an `IStorage` interface abstracting data operations. Uses PostgreSQL via `DatabaseStorage` class with Drizzle ORM.

**Authentication & Authorization**: Replit Auth integration with OIDC for secure login/logout. All API endpoints are protected with `isAuthenticated` middleware. New users select their role (client/analyst) on first login, and the `ProtectedRoute` component enforces role-based access on the frontend.

**Role-Based UI**: Separate page hierarchies for clients (`/client/*`) and analysts (`/analyst/*`) with dedicated layout components providing role-specific navigation.

**Component Architecture**: shadcn/ui components in `client/src/components/ui/` provide consistent styling. Layout components (`client-layout.tsx`, `analyst-layout.tsx`) wrap role-specific pages with sidebars.

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database operations and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Recharts**: Data visualization charts
- **embla-carousel-react**: Carousel component
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library

### Backend Libraries
- **Express**: HTTP server framework
- **express-session**: Session middleware
- **zod**: Runtime validation
- **nanoid**: Unique ID generation

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development
- **Tailwind CSS**: Utility-first CSS framework

### Design Resources
- **IBM Plex Sans/Mono**: Typography via Google Fonts CDN
- **Carbon Design System**: Design principles for data-heavy enterprise applications

## BI Studio Features

### Dataset Integration
- **CSV Parsing**: Upload CSV files with automatic type inference (string, number, date, boolean)
- **Schema Extraction**: Automatically extracts column names, types, and sample values
- **Dataset Management**: Full CRUD operations for datasets with project association
- **Sample Data**: Pre-seeded with Sales Data and Customer Analytics datasets for demo

### Visualization Builder
- **Visual Query Builder**: Select datasets, configure category/value fields, apply aggregations (sum, avg, count, min, max)
- **SQL Editor**: Raw SQL mode for advanced queries
- **Chart Types**: Bar, line, area, pie, donut, table, and metric charts
- **Color Customization**: Multiple color palettes (default, cool, warm, ocean, forest)
- **Number Formatting**: Currency, percentage, and number formats with configurable decimals
- **Live Preview**: Real-time chart preview as configuration changes

### Dashboard Sharing
- **Token-Based Sharing**: Secure share links with random tokens (nanoid)
- **Expiration Control**: Configurable link expiration (1-365 days)
- **Export Permissions**: Toggle to allow/disallow PDF/PNG export for shared links
- **Server-Side Validation**: Expired links return 410 Gone status

### Export Functionality
- **PNG Export**: Download dashboards as high-quality PNG images using html2canvas
- **PDF Export**: Export dashboards as PDF documents using jspdf
- **Client-Side Rendering**: Export happens in browser for data privacy

### Private Messaging
- **Project-Based Conversations**: Each project has its own chat conversation between client and analyst
- **Auto-Create Conversation**: Conversations are automatically created when accessing chat for projects with assigned analysts
- **Real-Time Updates**: Messages poll every 3 seconds for near-real-time experience
- **Read Status Tracking**: Server-side tracking of message read status
- **Message UI**: Avatar indicators (C for client, A for analyst), timestamps, message ownership styling
- **Empty States**: Proper handling when no messages exist or chat is unavailable

## API Endpoints

### Datasets
- `GET /api/datasets` - List all datasets (optional: `?projectId=`)
- `GET /api/datasets/:id` - Get single dataset with columns
- `POST /api/datasets/upload` - Upload CSV and create dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Dashboards
- `GET /api/dashboards` - List dashboards (optional: `?projectId=`)
- `GET /api/dashboards/:id` - Get dashboard with layout
- `POST /api/dashboards` - Create new dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `POST /api/dashboards/:id/share` - Create share link

### Visualizations
- `GET /api/visualizations` - List visualizations (optional: `?dashboardId=`)
- `GET /api/visualizations/:id` - Get single visualization
- `POST /api/visualizations` - Create visualization
- `PUT /api/visualizations/:id` - Update visualization
- `DELETE /api/visualizations/:id` - Delete visualization

### Query Execution
- `POST /api/query` - Execute query on dataset (visual or SQL mode)

### Public Access
- `GET /api/shared/:token` - Access shared dashboard (validates expiration)

### Conversations & Messages
- `GET /api/conversations/project/:projectId` - Get or create conversation for a project
- `GET /api/conversations/:conversationId/messages` - Get all messages in a conversation
- `POST /api/conversations/:conversationId/messages` - Send a new message
- `PUT /api/conversations/:conversationId/read` - Mark messages as read