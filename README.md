# AI Crypto Price Chatbot

A sophisticated AI-powered cryptocurrency price chatbot built with Next.js 15 and the Vercel AI SDK. This application demonstrates advanced LLM tool integration for real-time cryptocurrency price fetching from Binance API.

## 🚀 Features

### **Core AI Integration**

- **LLM Tool Calling**: Seamless integration with AI models for intelligent price queries
- **Real-time Streaming**: Live cryptocurrency price updates with streaming responses
- **Smart Symbol Recognition**: Automatic symbol normalization (BTC → BTCUSDT)
- **Multi-API Fallback**: Robust Binance API integration with multiple endpoint fallbacks

### **Cryptocurrency Price Features**

- **Live Price Fetching**: Real-time prices from Binance Spot API
- **Multiple Quote Assets**: Support for USDT, USDC, BTC, ETH, and more
- **Rich Price Data**: Complete trading pair information with base/quote detection
- **Error Handling**: Comprehensive error handling for invalid symbols and API failures

### **Technical Stack**

- **Next.js 15** with App Router and React Server Components
- **Vercel AI SDK** for unified LLM interactions and tool calling
- **OpenAI GPT-4o-mini** for intelligent price queries and responses
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for modern, responsive UI

## 🛠️ LLM Tool Integration

This project demonstrates advanced LLM tool calling capabilities:

### **Crypto Price Tool**

```typescript
export const getCryptoPrice = tool({
  description: "Get current spot price for a Binance trading pair",
  inputSchema: z.object({
    symbol: z
      .string()
      .min(2)
      .describe("Crypto symbol or pair, e.g. BTC or BTCUSDT"),
  }),
  execute: async ({ symbol }, { abortSignal }) => {
    // Real-time price fetching with error handling
  },
});
```

### **AI Integration**

The chatbot uses the AI SDK's `streamText` function with tool calling:

```typescript
const result = streamText({
  model: openai("gpt-4o-mini"),
  system:
    "You are a crypto price helper. When users mention a symbol like BTC or BTCUSDT, call getCryptoPrice and then summarize briefly.",
  messages: convertToModelMessages(messages),
  tools: { getCryptoPrice },
  stopWhen: stepCountIs(4),
});
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-chatbot
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💬 How to Use

### **Quick Price Check**

1. Enter a cryptocurrency symbol (e.g., `BTC`, `ETH`, `SOL`)
2. Press Enter or click "Get Price"
3. View real-time price information

### **Natural Language Queries**

- "What's the price of Bitcoin?"
- "Show me ETH price"
- "How much is SOL worth?"

### **Supported Formats**

- **Base symbols**: `BTC`, `ETH`, `SOL` (defaults to USDT)
- **Full pairs**: `BTCUSDT`, `ETHBTC`, `SOLUSDC`
- **Natural language**: "price of Bitcoin", "ETH value"

## 🏗️ Architecture

### **Frontend Components**

- `app/(chat)/page.tsx` - Main chat interface
- `components/chat.tsx` - Chat component with AI integration
- `components/message.tsx` - Message display component

### **Backend API**

- `app/(chat)/api/chat/crypto-price/route.ts` - Crypto price chat endpoint
- `lib/tools/crypto.ts` - Binance API integration tool

### **LLM Integration**

- Uses OpenAI GPT-4o-mini for intelligent responses
- Implements tool calling for real-time price fetching
- Streams responses for better user experience

## 🔧 API Integration

### **Binance API Features**

- **Multiple endpoints** for reliability
- **Automatic fallback** if primary endpoint fails
- **Real-time data** with no caching
- **Comprehensive error handling**

### **Supported Quote Assets**

- USDT, USDC, FDUSD, TUSD, BUSD
- BTC, ETH, BNB
- EUR, TRY, BRL

## 🧪 Error Handling

The application includes robust error handling:

- **Invalid symbols**: Clear error messages for unsupported pairs
- **API failures**: Automatic retry with multiple endpoints
- **Network issues**: Graceful degradation with user feedback
- **Rate limiting**: Proper handling of API limits

## 📊 Response Format

The crypto price tool returns rich, structured data:

```json
{
  "symbol": "BTCUSDT",
  "base": "BTC",
  "quote": "USDT",
  "price": 60000.0,
  "asOfISO": "2024-01-15T10:30:00.000Z",
  "source": "binance-spot"
}
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

### **Environment Variables**

- `OPENAI_API_KEY` - Required for AI model access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for LLM integration
- [Binance API](https://developers.binance.com/) for cryptocurrency data
- [Next.js](https://nextjs.org/) for the React framework
- [OpenAI](https://openai.com/) for the AI models

---

**Built with ❤️ for demonstrating advanced LLM tool integration and real-time cryptocurrency price fetching.**
