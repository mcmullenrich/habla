import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language: 'es',
    });

    if (!transcription.text || transcription.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No speech detected. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ transcript: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Could not transcribe audio. Please try again.' },
      { status: 500 }
    );
  }
}
