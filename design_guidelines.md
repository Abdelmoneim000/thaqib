# Design Guidelines: Embeddable Analytics SDK Dashboard

## Design Approach

**Selected Framework**: Carbon Design System (IBM)
**Justification**: Carbon is purpose-built for data-heavy enterprise applications with complex information hierarchies. Its robust component library, accessibility features, and white-label flexibility make it ideal for multi-tenant analytics platforms.

**Key References**: Looker Studio, Tableau Cloud, Metabase
**Design Principles**: Information clarity, data density balance, progressive disclosure, white-label flexibility

---

## Core Design Elements

### Typography
- **Primary Font**: IBM Plex Sans (via Google Fonts CDN)
- **Monospace Font**: IBM Plex Mono (for data/code)
- **Hierarchy**:
  - Dashboard Headers: text-2xl font-semibold
  - Section Titles: text-lg font-medium
  - Data Labels: text-sm font-normal
  - Metrics/KPIs: text-3xl font-bold (tabular-nums)
  - Body Text: text-base font-normal

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8
- Card spacing: gap-4, gap-6
- Dashboard gutters: px-6, py-4

**Grid Structure**:
- 12-column grid for dashboard layouts
- Responsive breakpoints: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Data tables: full-width with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Top Bar**: Fixed header with logo area (white-labelable), workspace selector, user menu
- **Sidebar**: Collapsible navigation (280px expanded, 64px collapsed) with icon-only collapsed state
- **Breadcrumbs**: Show current location in data hierarchy

### Data Display
- **Metric Cards**: KPI containers with large number, trend indicator, sparkline
- **Data Tables**: Sortable headers, pagination, row selection, density controls (compact/comfortable)
- **Charts**: Use Chart.js or Recharts - line, bar, pie, area charts with consistent styling
- **Filters**: Dropdown selects, date pickers, search inputs arranged horizontally

### Dashboard Components
- **Widget Containers**: Bordered cards with title bar, optional actions menu (⋮), drag handle for customization
- **Empty States**: Centered illustrations with action prompts for no data scenarios
- **Loading States**: Skeleton screens for tables/cards, spinner for charts

### Forms & Controls
- **Input Fields**: Consistent border treatment, clear labels, inline validation
- **Dropdowns**: Single/multi-select with search capability
- **Date Pickers**: Calendar overlay with range selection
- **Toggle Groups**: For view switching (chart/table), time ranges

### Modals & Overlays
- **Dialogs**: Centered modals for settings, configurations
- **Slide-overs**: Right-side panels for filters, detailed views
- **Tooltips**: Data point details on hover, contextual help

---

## Dashboard Layout Patterns

### Main Dashboard View
- Top bar (h-16) with global controls
- Sidebar (w-72 collapsible) with navigation
- Main content area with grid of metric cards and charts
- Responsive: Stack to single column on mobile

### Query Builder Interface
- Two-panel layout: left panel (schema browser), right panel (query editor + results)
- Split 30/70 on desktop, stacked on mobile
- Resizable divider between panels

### Report View
- Full-width data table with persistent header
- Floating action bar for export, share, schedule
- Right sidebar for filters (slide-over on mobile)

---

## White-Label Considerations
- CSS variables for primary accent, secondary colors
- Customizable logo placement in top bar
- Themeable chart colors
- Configurable typography (font-family override)

---

## Animations
**Minimal Motion**:
- Sidebar expand/collapse: 200ms ease transition
- Chart data updates: 300ms ease-in-out
- Dropdown menus: 150ms fade + slide
- NO scroll-triggered or decorative animations

---

## Images
**No hero images needed** - This is a functional dashboard application. Focus on data visualization and UI clarity rather than marketing imagery.

---

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for tables (arrow keys)
- Focus indicators on all controls
- High contrast mode support
- Screen reader announcements for data updates