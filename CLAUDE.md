# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (includes chmod permissions fix)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React application built with Vite using JavaScript (JSX). The project follows a feature-based component structure with authentication-protected routes.

### Key Architecture Components

**Frontend Stack:**
- React 19 with React Router DOM for routing
- Vite as build tool and development server
- TailwindCSS for styling with shadcn/ui components
- Material-UI components alongside custom UI components
- i18next for internationalization support
- Firebase for authentication backend

**State Management:**
- React Context for authentication state (`AuthContext`)
- Local storage for user session persistence
- Multiple context providers for different features (auth, lists, plans)

**Component Structure:**
- `src/components/` - Reusable components organized by feature
- `src/components/ui/` - shadcn/ui component library
- `src/pages/` - Page-level components with associated routing
- `src/context/` - React context providers for state management
- `src/config/` - Configuration files including Firebase setup

**Routing System:**
- Three route protection types in `src/routes/protectedRoutes.js`:
  - `ProtectedRoute` - For unauthenticated users only
  - `ProtectedAuthRoute` - For authenticated users only  
  - `OpenRoute` - Accessible to all users
- Main routing configuration in `src/routes/routes.jsx`

**Key Features:**
- User authentication with email/password and Google OAuth
- Data transformation and integration capabilities
- Multi-language support (English/Russian)
- Payment processing integration
- Analytics tracking (GTM, Hotjar)

### Configuration Files

- `vite.config.js` - Minimal Vite config with path aliases (`@` → `src/`)
- `components.json` - shadcn/ui configuration
- `eslint.config.js` - ESLint configuration with React hooks rules
- `jsconfig.json` - JavaScript project configuration
- Path alias `@` points to `src/` directory

### Important Notes

- Authentication state is managed via `AuthContext` and persisted in localStorage
- The app uses multiple UI libraries (Material-UI, shadcn/ui, React Bootstrap)
- Internationalization is set up but currently supports LTR layout for both languages
- Several routes are commented out in the routing configuration (profile, integrations, new-conversion)
- Firebase configuration is centralized in `src/config/firebaseConfig.js`