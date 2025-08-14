'use client';

import { useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatMessage } from './api/chat/crypto-price/route';

export default function Page() {
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: '/api/chat/crypto-price' }),
  });

  const isLoading = useMemo(() =>  status === 'submitted' || status === 'streaming', [status])

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">AI + Binance Price Chat</h1>

      {/* Quick price form */}
      <section className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Price Checker</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="e.g. BTC or BTCUSDT"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage({ text: `Price for ${symbol}` });
                setSymbol('');
              }
            }}
          />
          <button
            className="px-4 py-2 border rounded"
            onClick={() => {
              sendMessage({ text: `Price for ${symbol}` });
              setSymbol('');
            }}
            disabled={isLoading || !symbol.trim()}
          >
            Get Price
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Tip: try <code>BTC</code>, <code>ETH</code>, or full pairs like <code>BTCUSDT</code>.
        </p>
      </section>

      {/* Free-form chat */}
      <section className="rounded border p-4 space-y-3 text-black">
        <div className="space-y-3">
          {messages.map((m) => (
            <Message key={m.id} m={m} />
          ))}
        </div>

        <div className="flex gap-2 text-black">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ask anything… e.g. price of SOL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage({ text: input });
                setInput('');
              }
            }}
          />
          <button
            className="px-4 py-2 border rounded"
            onClick={() => {
              sendMessage({ text: input });
              setInput('');
            }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </section>
    </main>
  );
}

function Message({ m }: { m: ChatMessage }) {
  return (
    <div className="rounded bg-gray-50 p-3">
      {m.role === 'user' && <div><b>You:</b> {m.parts.map(p => ('text' in p ? p.text : '')).join('')}</div>}
      {m.role === 'assistant' &&
        m.parts.map((part, idx) => {
          if (part.type === 'text') {
            return <div key={idx}><b>AI:</b> {part.text}</div>;
          }
          return null;
        })}
    </div>
  );
}
