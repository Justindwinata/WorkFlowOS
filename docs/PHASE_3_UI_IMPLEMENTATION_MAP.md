# Phase 3 UI Implementation Map

## UIDESIGN Analysis Summary

**Total Screens**: 29 screens + 1 master DESIGN.md
**Total Files**: 57 (29 code.html + 29 screen.png)
**Screen Categories**:
- Auth: login, register
- Dashboard: desktop (2 variants), mobile
- Core Modules: tasks, projects, requests, incidents, approvals, SLA, notifications, users, teams, settings
- Detail Views: task_detail, project_detail, incident_detail, request_detail, approval_detail, team_detail
- Mobile: dashboard_mobile, tasks_mobile, requests_mobile, approvals_mobile
- Special States: system_states (error, permission, session, success)
- Additional: global_search, empty_state_projects, approvals_queue, approvals_mobile

---

## Screen Mapping

| UIDESIGN Folder | Screen | Route | Backend API | Data Model | Implementation Status |
|-----------------|--------|-------|-------------|------------|----------------------|
| `login_workflowos` | Login | `/login` | POST `/auth/login` | AuthService | ✅ Done (Phase 1) |
| `register_workflowos` | Register | `/register` | POST `/auth/register` | AuthService | ✅ Done (Phase 1) |
| `dashboard_workflowos_refined` | Dashboard Desktop | `/dashboard` | GET `/dashboard` | DashboardService | 🔄 In Progress |
| `dashboard_mobile_workflowos` | Dashboard Mobile | `/dashboard` | GET `/dashboard` | DashboardService | ⏳ Pending |
| `tasks_workflowos` | Tasks List | `/tasks` | GET `/tasks` | TaskService | 🔄 In Progress |
| `tasks_mobile_workflowos` | Tasks Mobile | `/tasks` | GET `/tasks` | TaskService | ⏳ Pending |
| `task_detail_wf_1024_workflowos` | Task Detail | `/tasks/:id` | GET `/tasks/:id` | TaskService | ⏳ Pending |
| `projects_workflowos` | Projects List | `/projects` | GET `/projects` | ProjectService | 🔄 In Progress |
| `project_detail_cloud_migration_workflowos` | Project Detail | `/projects/:id` | GET `/projects/:id` | ProjectService | ⏳ Pending |
| `requests_workflowos` | Requests List | `/requests` | GET `/requests` | RequestService | 🔄 In Progress |
| `requests_mobile_workflowos` | Requests Mobile | `/requests` | GET `/requests` | RequestService | ⏳ Pending |
| `request_detail_req_8021_workflowos` | Request Detail | `/requests/:id` | GET `/requests/:id` | RequestService | ⏳ Pending |
| `incidents_workflowos` | Incidents List | `/incidents` | GET `/incidents` | IncidentService | 🔄 In Progress |
| `incident_detail_inc_8492_workflowos` | Incident Detail | `/incidents/:id` | GET `/incidents/:id` | IncidentService | ⏳ Pending |
| `incident_detail_mobile_workflowos` | Incident Mobile | `/incidents/:id` | GET `/incidents/:id` | IncidentService | ⏳ Pending |
| `approvals_workflowos` | Approvals List | `/approvals` | GET `/approvals/pending` | ApprovalService | 🔄 In Progress |
| `approvals_queue_workflowos` | Approvals Queue | `/approvals` | GET `/approvals` | ApprovalService | 🔄 In Progress |
| `approvals_mobile_workflowos` | Approvals Mobile | `/approvals` | GET `/approvals/pending` | ApprovalService | ⏳ Pending |
| `approval_detail_req_8021_workflowos` | Approval Detail | `/approvals/:id` | GET `/approvals/:id` | ApprovalService | ⏳ Pending |
| `sla_monitoring_workflowos` | SLA Monitoring | `/sla` | GET `/sla` | SLAService | 🔄 In Progress |
| `notifications_workflowos` | Notifications | `/notifications` | GET `/notifications` | NotificationService | 🔄 In Progress |
| `users_workflowos` | Users List | `/users` | GET `/users` | UserService | 🔄 In Progress |
| `team_detail_engineering_workflowos` | Team Detail | `/teams/:id` | GET `/teams/:id` | TeamService | ⏳ Pending |
| `projects_workflowos` | Projects List | `/projects` | GET `/projects` | ProjectService | 🔄 In Progress |
| `project_detail_cloud_migration_workflowos` | Project Detail | `/projects/:id` | GET `/projects/:id` | ProjectService | ⏳ Pending |
| `settings_workflowos` | Settings | `/settings` | GET/POST `/settings` | SettingsService | ⏳ Pending |
| `notifications_workflowos` | Notifications | `/notifications` | GET `/notifications` | NotificationService | 🔄 In Progress |
| `global_search_workflowos` | Global Search | `/search` | GET `/search` | SearchService | ⏳ Pending |
| `empty_state_projects_workflowos` | Empty States | Various | - | - | ⏳ Pending |
| `system_states_workflowos` | Error/Permission/Session/Success | Various | - | - | ⏳ Pending |

---

## Design Token Extraction (from DESIGN.md + code.html)

### Colors (CSS Custom Properties)
```css
:root {
  /* Background & Surface */
  --background: #f9f9fc;
  --surface: #f9f9fc;
  --surface-bright: #f9f9fc;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f3f3f6;
  --surface-container: #eeeef0;
  --surface-container-high: #e8e8ea;
  --surface-container-highest: #e2e2e5;
  
  /* Text */
  --on-surface: #1a1c1e;
  --on-surface-variant: #434655;
  --on-background: #1a1c1e;
  
  /* Primary */
  --primary: #004ac6;           /* DESIGN.md: #2563eb (slight diff) */
  --primary-container: #2563eb; /* #2563eb per DESIGN.md */
  --on-primary: #ffffff;
  --on-primary-container: #eeefff;
  
  /* Secondary */
  --secondary: #505f76;
  --secondary-container: #d0e1fb;
  --on-secondary: #ffffff;
  --on-secondary-container: #54647a;
  
  /* Tertiary (Warning/Amber) */
  --tertiary: #943700;
  --tertiary-container: #bc4800;
  --on-tertiary: #ffffff;
  --on-tertiary-container: #ffede6;
  
  /* Error */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  --on-error-container: #93000a;
  
  /* Success (Green) - from code.html */
  --success: #059669;
  --success-container: #dcfce7;
  --on-success: #ffffff;
  --on-success-container: #166534;
  
  /* Outline */
  --outline: #737686;
  --outline-variant: #c3c6d7;
  --surface-variant: #e2e2e5;
  
  /* Primary (Blue) - used in code.html */
  --primary-blue: #2563eb;
  
  /* On-primary-fixed */
  --on-primary-fixed: #00174b;
  --on-primary-fixed-variant: #003ea8;
  --primary-fixed: #dbe1ff;
  --primary-fixed-dim: #b4c5ff;
  
  /* On-secondary-fixed */
  --on-secondary-fixed: #0b1c30;
  --on-secondary-fixed-variant: #38485d;
  --secondary-fixed: #d3e4fe;
  --secondary-fixed-dim: #b7c8e1;
  
  /* On-tertiary-fixed */
  --on-tertiary-fixed: #360f00;
  --on-tertiary-fixed-variant: #7d2d00;
  --tertiary-fixed: #ffdbcd;
  --tertiary-fixed-dim: #ffb596;
  
  /* Inverse */
  --inverse-surface: #2f3133;
  --inverse-on-surface: #f0f0f3;
  --inverse-primary: #b4c5ff;
  
  /* Surface tint */
  --surface-tint: #0053db;
  
  /* Scrim/Overlay */
  --scrim: rgba(0, 0, 0, 0.4);
}
```

### Typography Scale (from DESIGN.md)
```css
:root {
  --font-family: 'Inter', sans-serif;
  --font-display-lg: 600 32px/40px 'Inter', sans-serif;   /* letter-spacing: -0.02em */
  --font-display-md: 600 24px/32px 'Inter', sans-serif;   /* letter-spacing: -0.01em */
  --font-section-title: 500 18px/28px 'Inter', sans-serif;
  --font-body-base: 400 15px/24px 'Inter', sans-serif;
  --font-body-sm: 400 14px/20px 'Inter', sans-serif;
  --font-metadata: 500 12px/16px 'Inter', sans-serif;     /* letter-spacing: 0.01em */
  --font-button-label: 600 14px/20px 'Inter', sans-serif;
}
```

### Spacing (8px grid, 4px increments)
```css
:root {
  --space-unit: 4px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-gutter: 16px;
  --space-margin-page: 24px;  /* 16px on mobile */
}
```

### Border Radius
```css
:root {
  --radius-sm: 0.125rem;   /* 2px - DEFAULT per code.html (was 0.125rem) */
  --radius-default: 0.25rem; /* 4px - lg in DESIGN.md */
  --radius-lg: 0.375rem;   /* 6px - md in DESIGN.md */
  --radius-xl: 0.5rem;     /* 8px - lg in DESIGN.md */
  --radius-full: 9999px;   /* full in DESIGN.md */
  --radius-xl2: 0.75rem;   /* 12px - xl in DESIGN.md */
}
```

### Elevation/Shadows
```css
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05);   /* Soft shadow for modals/dropdowns */
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.1);
}
```

### Z-Index Scale
```css
:root {
  --z-base: 0;
  --z-nav: 100;
  --z-sticky: 200;
  --z-modal: 1000;
  --z-toast: 1100;
  --z-tooltip: 1200;
}
```

### Breakpoints
```css
:root {
  --bp-mobile: 768px;
  --bp-tablet: 1024px;
  --bp-desktop: 1440px;
}
```

### Layout Constants
```css
:root {
  --sidebar-width: 280px;
  --sidebar-rail-width: 64px;
  --topbar-height: 64px; /* 16 * 4 */
  --header-height: 56px; /* mobile */
  --topbar-height-desktop: 64px;
  --topbar-height-mobile: 56px;
  --page-margin: 24px;
  --page-margin-mobile: 16px;
  --gutter: 16px;
}
```

### Layout Model
- **Sidebar**: Fixed 280px (desktop), collapsible to 64px rail (tablet), hamburger drawer (mobile)
- **Topbar**: Sticky 64px height, search left-aligned, user menu right
- **Content**: Fluid, max-width 1600px, centered
- **Grid**: 12-column for dashboard KPIs
- **Mobile**: Page margin 16px, sidebar becomes drawer, bottom nav bar

---

## Component Hierarchy Mapping

### Shared Components (apps/web/src/components/ui/)

| Stitch Component | WorkFlowOS Component | File | Status |
|-----------------|---------------------|------|--------|
| Button (Primary/Secondary/Ghost) | `Button` | `Button.tsx` | ✅ Done |
| Card (KPI Card, Content Card) | `Card` | `Card.tsx` | ✅ Done |
| Input | `Input` | `Input.tsx` | ✅ Done |
| Label | `Label` | `Label.tsx` | ✅ Done |
| Table (Enterprise) | `DataTable` | `DataTable.tsx` | 🔄 In Progress |
| Badge/Status | `StatusBadge`, `PriorityBadge` | `Tabs.tsx` | ✅ Done |
| Tabs | `Tabs` | `Tabs.tsx` | ✅ Done |
| Dialog/Modal | `Dialog` | `Dialog.tsx` | ✅ Done |
| Sidebar/Nav | `Sidebar` | `Sidebar.tsx` | 🔄 In Progress |
| Topbar | `Topbar` | `Topbar.tsx` | 🔄 In Progress |
| Avatar | `Avatar` | (new) | ⏳ Pending |
| Badge/Chip | `Badge` | (new) | ⏳ Pending |
| Select | `Select` | (new) | ⏳ Pending |
| Checkbox | `Checkbox` | (new) | ⏳ Pending |
| Radio | `Radio` | (new) | ⏳ Pending |
| Switch | `Switch` | (new) | ⏳ Pending |
| Tooltip | `Tooltip` | (new) | ⏳ Pending |
| Dropdown/Menu | `DropdownMenu` | (new) | ⏳ Pending |
| Progress Bar | `Progress` | (new) | ⏳ Pending |
| Skeleton/Loading | `Skeleton` | (new) | ⏳ Pending |
| Pagination | `Pagination` | (new) | ⏳ Pending |
| Breadcrumb | `Breadcrumb` | (new) | ⏳ Pending |
| Avatar Group | `AvatarGroup` | (new) | ⏳ Pending |
| Divider | `Divider` | (new) | ⏳ Pending |

### Page-Level Components (apps/web/src/app/(dashboard)/)

| Screen | Path | Layout | Status |
|--------|------|--------|--------|
| Dashboard | `/dashboard` | `DashboardLayout` | 🔄 In Progress |
| Tasks List | `/tasks` | `DashboardLayout` | 🔄 In Progress |
| Task Detail | `/tasks/:id` | `DashboardLayout` | ⏳ Pending |
| Projects List | `/projects` | `DashboardLayout` | 🔄 In Progress |
| Project Detail | `/projects/:id` | `DashboardLayout` | ⏳ Pending |
| Requests List | `/requests` | `DashboardLayout` | 🔄 In Progress |
| Request Detail | `/requests/:id` | `DashboardLayout` | ⏳ Pending |
| Incidents List | `/incidents` | `DashboardLayout` | 🔄 In Progress |
| Incident Detail | `/incidents/:id` | `DashboardLayout` | ⏳ Pending |
| Approvals List | `/approvals` | `DashboardLayout` | 🔄 In Progress |
| Approval Detail | `/approvals/:id` | `DashboardLayout` | ⏳ Pending |
| SLA Monitoring | `/sla` | `DashboardLayout` | 🔄 In Progress |
| Notifications | `/notifications` | `DashboardLayout` | 🔄 In Progress |
| Users | `/users` | `DashboardLayout` | 🔄 In Progress |
| Teams | `/teams` | `DashboardLayout` | 🔄 In Progress |
| Team Detail | `/teams/:id` | `DashboardLayout` | ⏳ Pending |
| Audit Log | `/audit-log` | `DashboardLayout` | 🔄 In Progress |
| Settings | `/settings` | `DashboardLayout` | ⏳ Pending |

### Mobile-Specific Components
| Screen | Mobile Route | Component | Status |
|--------|-------------|-----------|--------|
| Dashboard | `/dashboard` | `DashboardMobile` | ⏳ Pending |
| Tasks | `/tasks` | `TasksMobile` | ⏳ Pending |
| Requests | `/requests` | `RequestsMobile` | ⏳ Pending |
| Approvals | `/approvals` | `ApprovalsMobile` | ⏳ Pending |

### Layout Components
| Component | Path | Status |
|-----------|------|--------|
| App Shell (Root Layout) | `app/layout.tsx` | 🔄 In Progress |
| Dashboard Layout | `app/(dashboard)/layout.tsx` | 🔄 In Progress |
| Auth Layout | `app/(auth)/layout.tsx` | ✅ Done |
| Topbar | `components/layout/Topbar.tsx` | 🔄 In Progress |
| Sidebar | `components/layout/Sidebar.tsx` | 🔄 In Progress |
| Mobile Nav | `components/layout/MobileNav.tsx` | ⏳ Pending |
| Mobile Drawer | `components/layout/MobileDrawer.tsx` | ⏳ Pending |
| Bottom Nav | `components/layout/BottomNav.tsx` | ⏳ Pending |
| Bottom Sheet | `components/ui/BottomSheet.tsx` | ⏳ Pending |
| Sticky Bottom FAB | `components/ui/FAB.tsx` | ⏳ Pending |

---

## API Integration Mapping

| Frontend Hook | Backend Endpoint | Method | Status |
|--------------|------------------|--------|--------|
| `useAuth()` | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/me` | POST/GET | ✅ |
| `useUsers()` | `/users` | GET | ✅ |
| `useCreateUser()` | `/users` | POST | ✅ |
| `useTeams()` | `/teams` | GET | ✅ |
| `useCreateTeam()` | `/teams` | POST | ✅ |
| `useProjects()` | `/projects` | GET | ✅ |
| `useCreateProject()` | `/projects` | POST | ✅ |
| `useTasks()` | `/tasks` | GET | ✅ |
| `useCreateTask()` | `/tasks` | POST | ✅ |
| `useTaskComments()` | `/tasks/:id/comments` | GET/POST | ⏳ |
| `useRequests()` | `/requests` | GET | ✅ |
| `useCreateRequest()` | `/requests` | POST | ✅ |
| `useIncidents()` | `/incidents` | GET | ✅ |
| `useCreateIncident()` | `/incidents` | POST | ✅ |
| `useApprovals()` | `/approvals/pending` | GET | ✅ |
| `useUpdateApproval()` | `/approvals/:id` | PATCH | ✅ |
| `useSlaDefinitions()` | `/sla` | GET | ✅ |
| `useSlaCheck()` | `/sla/:name/check` | POST | ✅ |
| `useNotifications()` | `/notifications` | GET | ✅ |
| `useUnreadNotifications()` | `/notifications/unread` | GET | ✅ |
| `useAuditLogs()` | `/audit-log` | GET | ✅ |
| `useDashboard()` | `/dashboard` | GET | 🔄 In Progress |
| `useWorkspaces()` | `/workspaces` | GET | ✅ |
| `useSwitchWorkspace()` | `/workspaces/switch` | POST | ✅ |

---

## Responsive Breakpoint Implementation

| Breakpoint | Sidebar | Topbar | Content | Tables | Mobile Specific |
|------------|---------|--------|---------|--------|-----------------|
| `< 768px` | Drawer | Sticky, hamburger menu | Margin 16px, stacked | Card view | Bottom nav, FAB, bottom sheets |
| `768-1024px` | Icon rail (64px) | Search visible | Margin 24px | Compact | Sidebar collapsible |
| `> 1024px` | Full 280px | Full search | Margin 24px, 12-col grid | Dense | Full desktop |

### Mobile-Specific Components
| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed 280px | Drawer (slide-in) |
| Topbar | Full search + actions | Hamburger + title + avatar |
| Tables | Horizontal scroll / dense | Card stack / horizontal scroll |
| Filters | Inline bar | Bottom sheet drawer |
| Actions | Inline buttons | Sticky bottom FAB |
| Pagination | Full | Compact |
| Search | Inline topbar | Sticky header |
| Filters | Inline | Bottom sheet |
| Actions | Inline | Sticky bottom bar |

---

## State Requirements (from system_states_workflowos)

| State | Component | Implementation |
|-------|-----------|----------------|
| Loading | All list/detail pages | Skeleton loaders + spinners |
| Empty | All list pages | EmptyState component |
| Error | All API calls | ErrorBoundary + toast |
| Success | Mutations | Toast notifications |
| Permission Denied | Protected routes | 403 page + redirect |
| Session Expired | Auth interceptor | Redirect to login |
| Success Toast | Mutations | Toast notification |
| Warning Toast | SLA warnings | Toast notification |

---

## Implementation Priority Order

| Phase | Screens | Dependencies |
|-------|---------|--------------|
| 1 | Design tokens, Shared components | - |
| 2 | App shell, Layout | Tokens |
| 3 | Auth (Login/Register) | Layout |
| 4 | Dashboard | Layout, API |
| 4a | Dashboard Mobile | Dashboard |
| 5 | Tasks + Detail | Dashboard, API |
| 6 | Projects + Detail | Dashboard, API |
| 7 | Requests + Detail | Dashboard, API |
| 8 | Incidents + Detail | Dashboard, API |
| 9 | Approvals + Detail | Dashboard, API |
| 10 | SLA Monitoring | Dashboard, API |
| 11 | Users + Teams | Dashboard, API |
| 12 | Notifications | Dashboard, API |
| 11 | Audit Log | Dashboard, API |
| 12 | Settings | Layout, API |
| 13 | Global Search | Layout, API |
| 12 | Empty/Error/Loading States | All |
| 13 | Responsive/Mobile | All desktop |
| 14 | Global Search/Filter | All lists |
| 13 | Component Tests | Components |
| 14 | E2E Tests | All |
| 14 | Build Validation | All |

---

## Tailwind Config Mapping

```js
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map Stitch tokens to Tailwind
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-bright': 'var(--surface-bright)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-variant': 'var(--surface-variant)',
        'surface-dim': 'var(--surface-dim)',
        foreground: 'var(--on-surface)',
        'foreground-variant': 'var(--on-surface-variant)',
        primary: 'var(--primary)',
        'primary-container': 'var(--primary-container)',
        'on-primary': 'var(--on-primary)',
        'on-primary-container': 'var(--on-primary-container)',
        secondary: 'var(--secondary)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary': 'var(--on-secondary)',
        'on-secondary-container': 'var(--on-secondary-container)',
        tertiary: 'var(--tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'on-tertiary': 'var(--on-tertiary)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        error: 'var(--error)',
        'error-container': 'var(--error-container)',
        'on-error': 'var(--on-error)',
        'on-error-container': 'var(--on-error-container)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'surface-tint': 'var(--surface-tint)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-default)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-xl2)',
        full: 'var(--radius-full)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        gutter: 'var(--space-gutter)',
        'margin-page': 'var(--space-margin-page)',
        unit: 'var(--space-unit)',
      },
      fontSize: {
        'display-lg': ['var(--font-size-display-lg)', { lineHeight: 'var(--font-line-height-display-lg)', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['var(--font-size-display-md)', { lineHeight: 'var(--font-line-height-display-md)', letterSpacing: '-0.01em', fontWeight: '600' }],
        'section-title': ['var(--font-size-section-title)', { lineHeight: 'var(--font-line-height-section-title)', fontWeight: '500' }],
        'body-base': ['var(--font-size-body-base)', { lineHeight: 'var(--font-line-height-body-base)', fontWeight: '400' }],
        'body-sm': ['var(--font-size-body-sm)', { lineHeight: 'var(--font-line-height-body-sm)', fontWeight: '400' }],
        metadata: ['var(--font-size-metadata)', { lineHeight: 'var(--font-line-height-metadata)', letterSpacing: '0.01em', fontWeight: '500' }],
        'button-label': ['var(--font-size-button-label)', { lineHeight: 'var(--font-line-height-button-label)', fontWeight: '600' }],
      },
      fontFamily: {
        sans: ['var(--font-family)'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      zIndex: {
        base: 'var(--z-base)',
        nav: 'var(--z-nav)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
      screens: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
      },
    },
  },
};
```

---

## File Structure (apps/web)

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── teams/page.tsx
│   │   │   ├── teams/[id]/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── projects/[id]/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── tasks/[id]/page.tsx
│   │   │   ├── requests/page.tsx
│   │   │   ├── requests/[id]/page.tsx
│   │   │   ├── incidents/page.tsx
│   │   │   ├── incidents/[id]/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   ├── approvals/[id]/page.tsx
│   │   │   ├── sla/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── audit-log/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # Shared primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── action-button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── avatar-group.tsx
│   │   │   ├── divider.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── avatar-group.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── FAB.tsx
│   │   ├── auth/
│   │   │   └── AuthProvider.tsx
│   │   └── dashboard/
│   │       └── DashboardStats.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth-store.ts
│   │   ├── query-client.ts
│   │   └── query-hooks.ts
│   ├── types/
│   │   └── index.ts
│   └── e2e/
│       └── workflow.e2e.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── playwright.config.ts
└── vitest.config.ts
```

---

## Implementation Notes

### Critical Design Decisions

1. **Color System**: Use CSS custom properties mapped from DESIGN.md tokens. Map to Tailwind via `tailwind.config.ts`.

2. **Typography**: Use `font-family: 'Inter'` throughout. Use Tailwind utility classes mapped to design tokens.

3. **Layout**: 
   - Desktop: Fixed sidebar (280px) + fluid content
   - Tablet (768-1024px): Collapsible sidebar (64px rail)
   - Mobile (<768px): Drawer + bottom nav + sticky FAB

3. **Tables**: 
   - Desktop: Dense, hover states, inline actions
   - Mobile: Card-based layout with horizontal scroll fallback

4. **Forms**: 
   - React Hook Form + Zod validation
   - Floating labels pattern
   - Inline validation with inline error messages

5. **States**:
   - Loading: Skeleton loaders matching content shape
   - Empty: Illustration + message + CTA
   - Error: Inline + toast
   - Success: Toast notification
   - Permission: 403 page + redirect
   - Session Expired: Redirect to login with toast

6. **Real-time**: 
   - SSE endpoint for notifications (`/notifications/stream`)
   - Unread count badge updates via SSE

7. **Mobile**:
   - Bottom navigation bar (5 items)
   - Sticky bottom FAB for primary action
   - Bottom sheets for filters/actions
   - Sticky search header
   - Horizontal scroll for KPI cards

8. **Icons**: Material Symbols Outlined (variable font)

### Technical Constraints

- **Next.js Build Issue**: ARM64 SWC panic on `next build`. Dev works. Document in `docs/NEXTJS_BUILD_ISSUE.md`. CI on x86 validates.
- **Docker**: Not available locally. Document limitation.
- **PWA**: Not required for Phase 3.

---

## Next Steps

1. **Commit 01**: Create `docs/PHASE_3_UI_IMPLEMENTATION_MAP.md`
2. **Commit 02**: Implement design tokens (CSS vars + Tailwind config)
3. **Commit 03**: Build reusable UI primitives
4. **Commit 04**: App shell (layout, sidebar, topbar)
5. **Commit 05**: Login page
6. **Commit 06**: Register page
7. **Commit 07**: Dashboard desktop
8. **Commit 08**: Dashboard mobile
... continue per commit plan