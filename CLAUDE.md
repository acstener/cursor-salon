# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 + Convex full-stack application template. The architecture consists of:

- **Frontend**: Next.js with React 19, TypeScript, and Tailwind CSS
- **Backend**: Convex (database, server functions, real-time sync)
- **Deployment**: Optimized for Vercel deployment

## Development Commands

### Core Development
- `npm run dev` - Start both frontend and backend development servers in parallel
- `npm run dev:frontend` - Start Next.js development server only
- `npm run dev:backend` - Start Convex development server only
- `npm run predev` - Set up Convex development environment and open dashboard

### Build and Production
- `npm run build` - Build the Next.js application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### Convex-Specific Commands
- `npx convex dev` - Start Convex development server
- `npx convex dashboard` - Open Convex dashboard
- `npx convex deploy` - Deploy Convex backend

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - Shared React components
- `convex/` - Backend functions, schema, and database logic
  - `_generated/` - Auto-generated Convex types and API
  - `schema.ts` - Database schema definitions
  - `myFunctions.ts` - Server-side functions (queries, mutations, actions)

### Key Components
- `ConvexClientProvider` - Wraps the app with Convex React client
- Layout uses Geist fonts and global CSS with Tailwind

### Convex Integration
- Uses new Convex function syntax with explicit validators
- Schema defines a `numbers` table with numeric values
- Example functions include `listNumbers`, `addNumber`, and `myAction`
- Real-time data sync between frontend and backend

## Important Configuration Files

### Cursor Rules
The project includes comprehensive Convex development guidelines in `.cursor/rules/convex_rules.mdc` covering:
- Function syntax and registration (query, mutation, action)
- Schema design and validation
- TypeScript best practices
- Database operations and indexing
- File storage and scheduling

### Key Rules to Follow
- Always use new Convex function syntax with explicit args/returns validators
- Use `internalQuery`, `internalMutation`, `internalAction` for private functions
- Define schemas in `convex/schema.ts` with proper indexing
- Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` for function calls
- Include type annotations when calling functions in the same file
- Always use `v.null()` for null return values

## Environment Setup
- Requires `NEXT_PUBLIC_CONVEX_URL` environment variable
- Convex client automatically configured in `ConvexClientProvider`

## Testing
No specific test framework is configured in this template. Check with the user about testing preferences before adding test commands.