# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Salon application built with Next.js 15 + Convex + Replicate integration. The architecture consists of:

- **Frontend**: Next.js with React 19, TypeScript, shadcn/ui, and TweakCN theme
- **Backend**: Convex (database, server functions, real-time sync)
- **AI Integration**: Replicate API for Google's Nano-Banana image transformation model
- **UI Framework**: shadcn/ui components with custom TweakCN styling

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
- `npx convex run salon:generateNanoBanana '{"prompt":"...", "imageUrls":["..."]}'` - Test AI generation
- `npx convex env set REPLICATE_API_TOKEN <token>` - Set Replicate API token

### shadcn/ui Commands
- `npx shadcn@latest add <component>` - Add new UI components
- `npx shadcn@latest init` - Initialize shadcn/ui (already done)
- `pnpm dlx shadcn@latest add <theme-url>` - Add custom themes

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `salon/` - AI image transformation page
- `components/` - Shared React components
  - `ui/` - shadcn/ui components (button, card, input, textarea, label)
- `convex/` - Backend functions, schema, and database logic
  - `_generated/` - Auto-generated Convex types and API
  - `schema.ts` - Database schema definitions
  - `myFunctions.ts` - Demo functions (queries, mutations, actions)
  - `salon.ts` - AI image generation actions using Replicate
- `lib/` - Utility functions (utils.ts for shadcn/ui)

### Key Application Features
- **AI Salon Route** (`/salon`) - Image transformation using Google's Nano-Banana model
- **Real-time UI** - Convex provides real-time data sync
- **Modern Design** - TweakCN theme with Inter, Fira Code, and Playfair Display fonts
- **Component System** - shadcn/ui components with consistent styling

### Convex + Replicate Integration
- Uses Convex actions (not mutations) for external API calls to Replicate
- `generateNanoBanana` action handles image transformation requests
- Environment variable `REPLICATE_API_TOKEN` required for API access
- Actions run in Node.js runtime for npm package compatibility

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

### Required Environment Variables
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL (auto-generated)
- `REPLICATE_API_TOKEN` - Replicate API token for AI model access

### Local Development Setup
1. `npm install` - Install dependencies
2. `npm run dev` - Start both frontend and backend servers
3. Set Replicate token: `npx convex env set REPLICATE_API_TOKEN <your-token>`

### Key Dependencies
- **replicate** - Node.js client for Replicate API
- **shadcn/ui** - Component library with Radix UI primitives
- **class-variance-authority** - Component variant styling
- **tailwind-merge** - Tailwind class merging utility

## AI Integration Patterns

### Using Actions for External APIs
- Always use `action` (not `mutation`) for external API calls
- Include `"use node"` directive for Node.js runtime access
- Use `useAction` hook in React components, not `useMutation`
- Handle URL object conversion to strings for Convex compatibility

### Replicate Integration Flow
1. Frontend calls Convex action with prompt and image URLs
2. Action initializes Replicate client with environment token
3. Runs Google Nano-Banana model via `replicate.run()`
4. Extracts URL string from FileOutput object
5. Returns image URL to frontend for display