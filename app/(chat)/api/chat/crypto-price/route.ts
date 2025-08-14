import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type InferUITools,
  type UIDataTypes,
  type UIMessage,
} from 'ai';
import { getCryptoPrice } from '@/lib/tools/crypto';

const tools = {
  getCryptoPrice,
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system:
      'You are a crypto price helper. When users mention a symbol like BTC or BTCUSDT, call getCryptoPrice and then summarize briefly.',
    messages: convertToModelMessages(messages),
    tools,
    // Let the model call tools and then finish within a few steps
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse();
}
