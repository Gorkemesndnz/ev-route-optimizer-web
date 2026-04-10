# Project Guidelines

## Code Style
- Follow the existing React + TypeScript patterns in [src/](src/).
- Prefer small component-local changes and keep the current `@/` alias usage consistent.
- Reuse existing UI, context, and hook patterns instead of introducing a new app-wide abstraction.

## Architecture
- Treat this folder as the UI layer only; do not move route-planning, simulation, or gateway logic here.
- Keep pages, components, contexts, hooks, and types aligned with their current responsibilities.
- Refer to [README.md](README.md) for setup and app structure instead of duplicating it here.

## Build and Test
- Install dependencies with `npm install`.
- Run the app with `npm run dev`.
- Build with `npm run build`.
- Lint with `npm run lint`.
- Use [start_all.ps1](start_all.ps1) only when you need the full stack locally.

## Conventions
- Keep API endpoints, environment values, and runtime configuration configurable.
- Prefer existing components and shared utilities over one-off replacements.
- Keep changes consistent with the current Vite frontend conventions.
