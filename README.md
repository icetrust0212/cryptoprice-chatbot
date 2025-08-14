# AI Crypto Price Chatbot

A simple, focused AI-powered cryptocurrency price chatbot built with Next.js 15 and OpenAI. Get real-time crypto prices using natural language queries.

## ✨ Features

- **Natural Language Queries**: Ask "What's the price of Bitcoin?" or "Show me ETH price"
- **Real-time Data**: Live prices from Binance API
- **Smart Interface**: Quick price checker + chat interface
- **Simple Setup**: Only needs OpenAI API key

## 🚀 Quick Start

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd ai-chatbot
   pnpm install
   ```

2. **Add environment variable**

   ```bash
   # Create .env.local
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run locally**

   ```bash
   pnpm dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 💬 How to Use

### Quick Price Check

- Enter symbol (BTC, ETH, SOL) in the sidebar
- Click "Check" or press Enter

### Natural Language Chat

- Ask questions like:
  - "What's the price of Bitcoin?"
  - "Show me ETH price"
  - "How much is SOL worth?"

### Supported Formats

- **Symbols**: BTC, ETH, SOL (defaults to USDT)
- **Pairs**: BTCUSDT, ETHBTC, SOLUSDC
- **Natural language**: "price of Bitcoin", "ETH value"

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **OpenAI GPT-4o-mini** - AI model
- **Vercel AI SDK** - LLM integration
- **Binance API** - Crypto price data
- **Tailwind CSS** - Styling

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy!

## 📁 Project Structure

```
app/(chat)/
├── page.tsx              # Main UI
└── api/chat/crypto-price/route.ts  # API endpoint
lib/tools/
└── crypto.ts             # Binance API integration
```

## 🔧 Troubleshooting

**Binance API issues on Vercel?**

- The app tries multiple Binance endpoints automatically
- Check Vercel function logs for specific errors
- May need to use different deployment region

---

Built with ❤️ using Next.js and OpenAI
