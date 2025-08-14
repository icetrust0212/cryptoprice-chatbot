'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatMessage } from './api/chat/crypto-price/route';

export default function Page() {
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat/crypto-price' }),
  });

  const isLoading = useMemo(() => status === 'submitted' || status === 'streaming', [status]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = (text: string) => {
    if (text.trim()) {
      sendMessage({ text });
      setInput('');
    }
  };

  const handleQuickPrice = () => {
    if (symbol.trim()) {
      sendMessage({ text: `Price for ${symbol}` });
      setSymbol('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-4xl p-6 lg:pt-28 ">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Crypto Price Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Get real-time cryptocurrency prices with natural language queries
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Price Checker - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="size-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Quick Price Check
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                    placeholder="e.g. BTC, ETH, SOL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickPrice();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <button
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isLoading || !symbol.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    }`}
                    onClick={handleQuickPrice}
                    disabled={isLoading || !symbol.trim()}
                  >
                    {isLoading ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Check'
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>💡 Try: <code className="bg-gray-100 px-1 rounded">BTC</code>, <code className="bg-gray-100 px-1 rounded">ETH</code></p>
                  <p>💡 Or full pairs: <code className="bg-gray-100 px-1 rounded">BTCUSDT</code></p>
                </div>

                {/* Popular Symbols */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Popular:</p>
                  <div className="flex flex-wrap gap-2">
                    {['BTC', 'ETH', 'SOL', 'ADA', 'DOT'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          setSymbol(sym);
                          setTimeout(() => handleQuickPrice(), 100);
                        }}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h3 className="text-white font-semibold flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  AI Assistant
                </h3>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Start a conversation</h3>
                    <p className="text-gray-600 mb-4">Ask about cryptocurrency prices in natural language</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Examples:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What's the price of Bitcoin?",
                          "Show me ETH price",
                          "How much is SOL worth?"
                        ].map((example) => (
                          <button
                            key={example}
                            onClick={() => handleSendMessage(example)}
                            className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <Message key={m.id} m={m} />
                  ))
                )}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
                
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex space-x-3">
                  <input
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Ask about crypto prices... e.g. 'What's the price of Bitcoin?'"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(input);
                      }
                    }}
                    disabled={isLoading}
                  />
                  <button
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isLoading || !input.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                    }`}
                    onClick={() => handleSendMessage(input)}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by OpenAI GPT-4o-mini • Data from Binance API</p>
        </footer>
      </div>
    </div>
  );
}

function Message({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isUser ? (
          <div className="font-medium">{m.parts.map(p => ('text' in p ? p.text : '')).join('')}</div>
        ) : (
          <div className="space-y-2">
            {m.parts.map((part, idx) => {
              if (part.type === 'text') {
                return (
                  <div key={idx} className="leading-relaxed">
                    {part.text}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
