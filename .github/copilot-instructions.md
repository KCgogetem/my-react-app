# Copilot Instructions for my-react-app

## Project Overview
- **Framework:** React + TypeScript, built with Vite
- **Structure:**
  - `src/` contains all application code, organized by feature: `components/`, `pages/`, `api/`, `lib/`, `internals/`, `shared-theme/`
  - `public/` for static assets
  - `contracts/` for contract-related JSON
- **Entry Point:** `src/main.tsx` (mounts `App.tsx`)

## Key Patterns & Conventions
- **Component Organization:**
  - UI components in `src/components/`
  - Page-level components in `src/pages/`
  - Shared logic/utilities in `src/lib/`
  - Data and grid logic in `src/internals/data/`
- **API Calls:**
  - Use files in `src/api/` for backend/service communication (e.g., `adminUsers.ts`, `cmaPipeline.ts`)
- **Auth:**
  - Auth logic in `src/amplify-auth.ts` and `src/lib/auth.ts`
- **Theme:**
  - Theming handled in `src/theme.ts` and `src/shared-theme/`

## Developer Workflows
- **Start Dev Server:**
  - `npm run dev` (Vite hot-reload server)
- **Build:**
  - `npm run build`
- **Lint:**
  - `npm run lint` (uses ESLint, see `eslint.config.js`)
- **Type Checking:**
  - `tsc --noEmit` (uses `tsconfig.app.json` and `tsconfig.node.json`)

## Notable Integrations
- **Vite Plugins:** See `vite.config.ts` for plugin setup
- **ESLint:** Custom config in `eslint.config.js` (type-aware rules recommended)
- **Amplify Auth:** Used for authentication (see `amplify-auth.ts`)

## Project-Specific Guidance
- **Data Flow:**
  - API modules in `src/api/` are the source of truth for backend data access
  - Components/pages should import from these modules, not call fetch directly
- **Styling:**
  - Use CSS modules or import styles in component files (see `App.css`, `index.css`)
- **Adding Pages:**
  - Place new pages in `src/pages/`, register routes in the main app if using routing
- **Contracts:**
  - JSON contracts in `contracts/` are used for data validation or API schemas

## Examples
- To add a new API call: create a function in `src/api/yourModule.ts` and import it where needed
- To add a new theme color: update `src/theme.ts` and/or `src/shared-theme/AppTheme.tsx`

---
For more details, see the [README.md](../../README.md) and config files in the project root.
