# D4ISY - Autonomous Vibe Trader

![D4ISY Banner](src/assets/daisy-logo-new.png)

## Overview

D4ISY is an autonomous leverage trading AI agent powered by the Aster API. Inspired by the flower family that Aster originates from, D4ISY combines advanced AI analysis with real-time market data to provide comprehensive cryptocurrency trading insights and signals.

## Features

### 🤖 AI Market Analysis
- Advanced AI-powered market analysis for any token available on Aster
- Real-time insights powered by cutting-edge language models
- Interactive chat interface for market intelligence queries
- Support for 40+ major cryptocurrency trading pairs

### 📊 Altcoin Futures Key Indicators
Real-time monitoring of critical market metrics:
- **Open Interest**: Track total open positions across exchanges
- **Funding Rates**: Monitor average funding rates to gauge market sentiment
- **Long/Short Ratios**: Analyze trader positioning and market bias
- **24h Liquidations**: Track liquidation events across the market
- **Fear & Greed Index**: Gauge overall market sentiment
- **RSI Indicators**: Technical analysis for overbought/oversold conditions
- **Active Buy Ratios**: Monitor buying pressure across exchanges
- **Options Open Interest**: Track derivatives market activity

### 📈 Key Indicator Charts
Interactive visualizations including:
- 24-hour price history with real-time updates
- Open interest trends across major cryptocurrencies
- Exchange-specific active buy ratios
- Liquidation analysis by exchange (longs vs shorts)
- 30-day Fear & Greed Index history

### 🎯 D4ISY Signals & Trading Intelligence
- Live trading signals with detailed rationale
- Real-time position tracking
- Performance metrics (realized/unrealized PnL)
- Trade history and analytics

### 🌐 Live Trading
- Integration with Aster Exchange for live trading data
- Real-time order book visualization
- Active positions monitoring
- Market ticker information

### 🔍 Comprehensive Market Coverage
Support for 20+ major cryptocurrencies:
- Bitcoin (BTC), Ethereum (ETH), BNB, Solana (SOL)
- XRP, Cardano (ADA), Dogecoin (DOGE), Polygon (MATIC)
- Polkadot (DOT), Litecoin (LTC), Avalanche (AVAX)
- Chainlink (LINK), Uniswap (UNI), Cosmos (ATOM)
- And many more altcoins

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for interactive data visualizations
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase Edge Functions
- **AI Integration**: Advanced language models for market analysis
- **Internationalization**: i18next (English & Chinese support)
- **APIs**: 
  - Aster Exchange API
  - CoinGlass Market Data API

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/D4ISY.git

# Navigate to project directory
cd D4ISY

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Project Structure

```
D4ISY/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AIAnalysisChat.tsx
│   │   ├── MarketOverview.tsx
│   │   ├── MarketCharts.tsx
│   │   ├── DaisySimulation.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization
│   │   └── locales/        # Language files (en, zh)
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase configuration
│   ├── pages/              # Page components
│   └── assets/             # Static assets
├── supabase/
│   └── functions/          # Edge Functions for data fetching
│       ├── ai-market-analysis/
│       ├── aster-exchange-info/
│       ├── aster-market-ticker/
│       ├── aster-order-book/
│       └── coinglass-data/
└── public/                 # Public assets
```

## Key Components

### AI Analysis Engine
Provides intelligent market analysis using advanced language models, capable of analyzing market trends, technical indicators, and sentiment across multiple tokens.

### Market Overview Dashboard
Real-time monitoring dashboard displaying 8 critical market indicators with support for 20+ cryptocurrencies.

### Interactive Charts
Comprehensive charting system with 5 different visualization types tracking price, open interest, exchange metrics, liquidations, and sentiment indicators.

### Multilingual Support
Full support for English and Chinese languages, making D4ISY accessible to global traders.

## API Integration

D4ISY integrates with multiple data sources:
- **Aster Exchange**: Live trading data, order books, and market information
- **CoinGlass**: Advanced derivatives market data including OI, funding rates, liquidations
- **Lovable AI**: Intelligent market analysis and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Aster flower family
- Powered by Aster API
- Built with Lovable
- Market data provided by CoinGlass

## Support

For support, questions, or feature requests, please open an issue on GitHub.

---

**D4ISY** - Your Autonomous Vibe Trader for the crypto markets 🌸
