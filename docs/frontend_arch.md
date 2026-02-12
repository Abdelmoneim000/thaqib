# Frontend Architecture

## Overview
Built with React, TypeScript, and Vite. Uses `wouter` for routing and `@tanstack/react-query` for data fetching. Styling via `shadcn/ui` and Tailwind CSS.

## Core Libraries
- **Routing**: `wouter` - Lightweight router.
- **State Management**: `@tanstack/react-query` (Server state), `useAuth` hook (Auth state).
- **UI Components**: `shadcn/ui` (Radix Primitives + Tailwind).
- **Charts**: `recharts` wrapped in `ChartRenderer`.
- **Forms**: `react-hook-form` + `zod` validation.

## Directory Structure
- `src/components`: Reusable UI components.
  - `ui`: Base components (Button, Card, etc.).
  - `bi`: Charting components (`ChartRenderer`, `VizBuilder`).
  - `chat`: Chat interface (`ChatPanel`, `ProjectChat`).
- `src/hooks`: Custom hooks (`use-auth`, `use-toast`, `use-mobile`).
- `src/lib`: Utilities (`queryClient`, `utils`, `bi-types`).
- `src/pages`: Page components organized by role.
  - `auth`: Login/Register.
  - `client`: Client-specific pages (Projects, Datasets, Settings).
  - `analyst`: Analyst-specific pages (Dashboard, Visualizations, Browse).
  - `admin`: Admin dashboard.

## Key Concepts

### Authentication
Handled by `AuthProvider` in `src/hooks/use-auth.tsx`.
- Checks `/api/user` on mount.
- Provides `login`, `register`, `logout` methods.
- `ProtectedRoute` in `App.tsx` guards routes based on role.

### Data Fetching
`queryClient.ts` configures distinct query/mutation defaults.
- invalidates queries on mutation success to keep UI in sync.
- `apiRequest` helper handles standard fetch with JSON headers.

### BI Implementation
- **Visualizations**: Defined by `Visualization` schema (shared).
- **Renderer**: `ChartRenderer` component takes `type`, `data`, and `config` to render charts.
- **Builder**: `VisualizationBuilder` allows creating charts from datasets.

### Role-Based Access
- **Client**: Can create projects, upload datasets, accept applications.
- **Analyst**: Can browse projects, apply, create dashboards/visualizations.
- **Admin**: Full access to manage users and platform stats.
