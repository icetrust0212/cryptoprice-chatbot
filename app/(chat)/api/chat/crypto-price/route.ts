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
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response('Invalid JSON in request body', { status: 400 });
    }

    const { messages } = body;

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response('Messages must be an array', { status: 400 });
    }

    if (messages.length === 0) {
      return new Response('Messages array cannot be empty', { status: 400 });
    }

    // Validate each message structure
    for (const message of messages) {
      if (!message || typeof message !== 'object') {
        return new Response('Invalid message format', { status: 400 });
      }
      if (!message.role || !['user', 'assistant'].includes(message.role)) {
        return new Response('Invalid message role', { status: 400 });
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const result = streamText({
        model: openai('gpt-4o-mini'),
        system:
          'You are a crypto price helper. When users mention a symbol like BTC or BTCUSDT, call getCryptoPrice and then summarize briefly. If there are any errors getting the price, explain the issue clearly to the user.',
        messages: convertToModelMessages(messages),
        tools,
        // Let the model call tools and then finish within a few steps
        stopWhen: stepCountIs(4),
      });

      clearTimeout(timeoutId);
      return result.toUIMessageStreamResponse();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return new Response('Request timeout - please try again', { status: 408 });
        }
        if (error.message.includes('OpenAI')) {
          console.error('OpenAI API error:', error);
          return new Response('AI service temporarily unavailable - please try again', { status: 503 });
        }
      }
      
      console.error('Unexpected error in chat API:', error);
      return new Response('Internal server error - please try again', { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
