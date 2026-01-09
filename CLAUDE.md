# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quereada is a customizable feed reader that builds personalized feeds from internet content. Unlike traditional RSS readers where each source is its own feed, Quereada collects items into a database and lets users define feeds as queries against that database.

Available as both an Electron desktop app and a self-hosted Express web app.

## Development Commands

```bash
# Database (required before first run)
npm run db:build          # Generate Prisma client and run migrations

# Electron (desktop)
npm run electron:dev      # Development with hot reload
npm run electron:build    # Build for production
npm run electron:package:mac  # Package Mac app to dist/

# Web
npm run web:build         # Build frontend to out-web/
npm run web:start         # Start Express server (must build first)

# Tests
npm run test              # Run vitest
npx vitest run path/to/test.ts  # Run a single test file
```

## Architecture

### Dual Platform with Bridge Pattern

The app runs on both Electron and web with shared frontend code. The `src/bridge/` layer abstracts platform differences:

- **API Endpoint**: `src/bridge/api_endpoint/`
  - `electron/` - IPC handlers for main process communication
  - `web/` - HTTP endpoints via Express
  - `frontend.ts` - Unified frontend API interface

- **Item Streaming**: `src/bridge/loading_items_to_feed/`
  - `electron/` - IPC-based streaming
  - `web/` - WebSocket streaming

### Backend (`src/backend/`)

- `main/electron/index.ts` - Electron main process entry
- `main/web/index.ts` - Express server entry
- `database.ts` - Prisma client initialization
- `load_config.ts` - Loads and upserts config into database
- `digest.ts` - Functions for generating and retrieving digest content
- `fetch.ts` - Fetches items from all sources
- `summarize.ts` - OpenAI-based article summarization

### Frontend (`src/frontend/`)

Svelte-based SPA. Key components:
- `App.svelte` - Main app with feed navigation
- `Feed.svelte` - Displays items for selected feed
- `Article.svelte`, `Link.svelte` - Item type renderers

### Modules (`modules/`)

Pluggable implementations for extensibility:

- **Sources** (`modules/sources/`): Implementations for fetching items
  - Base class: `source.ts` - Extend `Source<T>` and implement `fetchItemsFromSource()`
  - Implementations: `RSS.ts`, `NYTimesAPI.ts`, `Reddit.ts`, `aeon.ts`, `transformer_circuits.ts`

- **Filters** (`modules/filters/`): Boolean functions applied to items
  - Implementation example: `relevant_to_topics.ts` - Uses OpenAI to check topic relevance

### Configuration Flow

1. User config lives in `quereada.config.ts` (project root for web, `~/.config/quereada/` for desktop)
2. Config exports: `sources`, `filters`, `blocks`, `feeds`
3. `loadConfig()` upserts these into the database
4. Feeds are composed of blocks, each block is a Prisma query against items

### Data Model (Prisma)

Key relationships:
- **Source** → **Item**: Sources fetch and create items
- **Block**: Contains a Prisma query (`Prisma.ItemFindManyArgs`)
- **Feed** → **Block** (via OrderedBlocksInFeed): Feeds compose multiple blocks
- **Filter** → **Item** (via filters_passed): Tracks which items passed which filters

## Path Aliases

Defined in `tsconfig.json`:
- `$src/*` → `src/*`
- `$lib/*` → `src/lib/*`
- `$root/*` → project root

## Environment Variables

- `DATABASE_URL` - Database connection string (defaults to SQLite `store.db`)
- `CONFIG_PATH` - Path to `quereada.config.ts`
- `OPENAI_API_KEY` - Required for summarization and topic filters
