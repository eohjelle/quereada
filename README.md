# Quereada

Quereada provides tools to build your own feeds from anything on the internet. It is available as a desktop app or self-hosted web app. [Click here](https://quereada-342c36fe2c15.herokuapp.com) to see a demo.

Quereada is inspired by RSS readers, but more customizable and flexible. Think of it as an data pipeline for information, built from modular components:

1. **Sources**: Generalized RSS feeds that collect _items_ from anywhere on the internet and store them in a local database. Examples: news articles, arxiv papers, blog posts, tweets, sports scores, job postings.

2. **Filters**: Used to filter items. For example, by filtering for items that are relevant (or not) to certain topics.

3. **Blocks**: Components that make up feeds:

   - _Streams_: Infinite-scroll item lists defined by database queries.
   - _Digests_: LLM-generated summaries of items and/or digests from other blocks. These are composable.

4. **Feeds**: Sequences of blocks that users navigate between.

Some features (summarization, topic filtering, digests) use external APIs. Quereada minimizes API calls and caches results to avoid duplicates.

## Installation

### Desktop App

```bash
git clone https://github.com/eohjelle/quereada.git
cd quereada
npm install
npm run db:build
npm run electron:package:mac
```

The app will be in the `dist` folder. Pre-built releases may be available on the [Releases](https://github.com/quereada/quereada/releases) page.

_Note:_ If building for a different platform than your current one, you may need to modify the Prisma schema to use the correct database driver. See [this discussion](https://github.com/prisma/prisma/discussions/21027).

**Config location**: `~/.config/quereada/` (Linux), `~/Library/Application Support/quereada/` (macOS), `AppData\Roaming\quereada` (Windows)

### Web App

```bash
git clone https://github.com/eohjelle/quereada.git
cd quereada
npm install
npm run db:build
npm run web:build
npm run web:start
```

Uses SQLite by default. For PostgreSQL, update `schema.prisma` and set `DATABASE_URL` in `.env`.

**Config location**: Project root (`.env` for keys, `quereada.config.ts` for feeds)

## Configuration

### API Keys

| Key              | Used for                              |
| ---------------- | ------------------------------------- |
| `OPENAI_API_KEY` | Summarization, topic filters, digests |

Set keys in `keys.json` (desktop) or `.env` (web).

### Adding Content

The easiest way to configure Quereada is through the UI. Click the **+** button to:

- Add RSS sources (with auto-discovery from website URLs)
- Create queries with filters
- Generate AI digests
- Compose feeds from blocks

Changes are saved to `quereada.config.ts`.

### Manual Configuration

The `quereada.config.ts` file exports four arrays:

```typescript
export const sources: ConfigSource[] = [...];   // Where to fetch items
export const filters: ConfigFilter[] = [...];   // AI-powered filters
export const blocks: ConfigBlock[] = [...];     // Queries or digests
export const feeds: ConfigFeed[] = [...];       // What users see
```

## Extending

Add custom implementations in `modules/`:

- **Sources**: Extend the `Source` class in `modules/sources/`
- **Filters**: Implement the `Filter` type in `modules/filters/`

## Development

```bash
npm run electron:dev                      # Desktop with hot reload
npm run web:build && npm run web:start    # Web app
npm run test                              # Run tests
```
