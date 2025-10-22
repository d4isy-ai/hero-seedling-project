# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D4ISY is an autonomous leverage trading AI agent for cryptocurrency markets, powered by the Aster Exchange API. The application provides real-time market analysis, trading signals, and comprehensive market data visualization for 40+ cryptocurrency trading pairs.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Radix UI primitives + shadcn/ui components + Tailwind CSS
- **Data Management**: TanStack Query (React Query) for server state
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Internationalization**: i18next (English & Chinese)
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite with SWC for fast compilation

### Data Flow Architecture

The application follows a clear data flow pattern:

1. **API Layer** (Supabase Edge Functions):
   - `supabase/functions/aster-market-ticker/` - Fetches real-time market ticker data from Aster Exchange
   - `supabase/functions/aster-order-book/` - Retrieves order book data for trading pairs
   - `supabase/functions/aster-exchange-info/` - Gets exchange metadata
   - `supabase/functions/coinglass-data/` - Fetches advanced market metrics (OI, funding rates, liquidations)
   - `supabase/functions/ai-market-analysis/` - AI-powered market analysis using Lovable AI Gateway

2. **Data Hooks** (`src/hooks/`):
   - `useMarketData.ts` - Manages market ticker and order book queries with automatic refresh
   - `useCoinGlassData.ts` - Handles CoinGlass API data for derivatives metrics
   - All queries use TanStack Query with specific refetch intervals (2-30 seconds)

3. **Component Layer**:
   - Feature components in `src/components/` consume data hooks
   - UI primitives in `src/components/ui/` provide reusable design system
   - Components are organized by feature, not by type

### Key Components

- **AIAnalysisChat** (`src/components/AIAnalysisChat.tsx`) - Conversational AI interface for market analysis with streaming responses
- **MarketOverview** (`src/components/MarketOverview.tsx`) - Dashboard of 8 key market indicators across 20+ coins
- **MarketCharts** (`src/components/MarketCharts.tsx`) - 5 different chart types for price, OI, liquidations, etc.
- **DaisySimulation** (`src/components/DaisySimulation.tsx`) - D4ISY trading signals and position tracking
- **LiveTrading** (`src/components/LiveTrading.tsx`) - Live order book and trade execution interface

### State Management

- **No global state library** - Uses React Query for server state and React hooks for local state
- **Query caching** - TanStack Query handles all API caching with specific stale times
- **Real-time updates** - Polling intervals configured per query type (2s for tickers, 30s for metrics)

### Styling System

The project uses a custom design system built on Tailwind CSS:

- **Custom gradients**: `bg-gradient-daisy`, `bg-gradient-warm` defined in global CSS
- **Custom shadows**: `shadow-glow-primary`, `shadow-glow-success`, `shadow-glow-destructive`
- **HSL color system**: All colors use HSL CSS variables for easy theming
- **Responsive design**: Mobile-first approach with responsive grids and breakpoints

### Internationalization

- Language files in `src/i18n/locales/` (en.json, zh.json)
- Language persisted in localStorage
- Use `useTranslation()` hook for translations: `t('key.path')`
- Language selector component in header

## Environment Configuration

Required environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

Edge Functions also require:
```
LOVABLE_API_KEY=your_lovable_api_key  # For AI market analysis
```

## API Integration Notes

### Aster Exchange API
- Base URL: `https://fapi.asterdex.com/fapi/v1/`
- Proxied through Supabase Edge Functions to avoid CORS and add caching
- All market data endpoints follow Binance Futures API format

### CoinGlass API
- Provides derivatives market data (Open Interest, Funding Rates, Liquidations)
- Accessed through `coinglass-data` edge function
- Supports multiple endpoints for different metrics

### Lovable AI Gateway
- Model: `google/gemini-2.5-flash`
- Streaming responses for real-time chat experience
- System prompt configures "Daisy AI" personality and expertise

## Component Development Patterns

### Creating New Market Components
1. Create custom hook in `src/hooks/` if new API endpoint needed
2. Use TanStack Query with appropriate refetch interval
3. Handle loading, error, and empty states
4. Use existing UI primitives from `src/components/ui/`
5. Follow responsive design patterns (mobile-first)

### Adding New Supabase Edge Functions
1. Create new directory in `supabase/functions/`
2. Use Deno runtime (not Node.js)
3. Include CORS headers for all responses
4. Handle OPTIONS requests for preflight
5. Use environment variables for API keys

### Working with shadcn/ui Components
- Components are copied into `src/components/ui/` (not installed as package)
- Customize by editing the component files directly
- Configuration in `components.json`
- Add new components: use shadcn CLI or copy from shadcn/ui docs

## Path Aliases

The project uses `@/` alias for `./src/` directory:
```typescript
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
```

## Testing Market Features

When testing features that interact with market data:
1. Use development build to enable hot reload: `npm run dev`
2. Check browser console for API errors
3. Verify Supabase Edge Functions are deployed
4. Test with multiple symbols (BTC, ETH, SOL, etc.)
5. Verify real-time updates are working (check refetch intervals)

## Performance Considerations

- **Query caching**: TanStack Query caches all API responses; adjust `staleTime` if data freshness is critical
- **Refetch intervals**: Balance between data freshness and API load (current: 2-30s depending on endpoint)
- **Component lazy loading**: Not currently implemented but consider for route-based code splitting
- **Image optimization**: Logo and assets should be optimized for web
