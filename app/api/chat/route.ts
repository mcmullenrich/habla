import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/claude';
import { parseClaudeResponse } from '@/lib/errorAnalyzer';
import { ChatRequest, ChatResponse } from '@/types/conversation';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.transcript || body.transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const rawResponse = await sendMessage(body.history ?? [], body.transcript, body.scenarioPrompt);
    const { spanishText, corrections } = parseClaudeResponse(rawResponse);

    const response: ChatResponse = {
      spanishResponse: spanishText,
      corrections,
      rawResponse,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response. Please try again.' },
      { status: 500 }
    );
  }
}
