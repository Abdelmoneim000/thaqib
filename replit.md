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

**Storage Interface Pattern**: `server/storage.ts` defines an `IStorage` interface abstracting data operations. Currently uses in-memory storage (`MemStorage`) but designed for easy PostgreSQL migration.

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