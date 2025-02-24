import OpenAI from 'openai'
import { TONES, ToneType } from './tones'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 second timeout
  maxRetries: 3,  // Retry failed requests up to 3 times
})

export async function generateThread(prompt: string, tone: ToneType) {
  try {
    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Fallback to 3.5 for faster response
        messages: [
          {
            role: "system",
            content: `You are a professional content writer who writes in the style of ${TONES[tone].name}.
              Style guide: ${TONES[tone].style}
              
              Format the thread as follows:
              1. Start each tweet with a number followed by a period (1., 2., etc)
              2. Keep each tweet under 280 characters
              3. Use line breaks between tweets
              4. Do not use special characters that could cause parsing issues
              5. Focus on ${TONES[tone].description}
              
              Respond only with the formatted thread content.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
    ]) as OpenAI.Chat.ChatCompletion;

    // Clean and validate the response
    const thread = response.choices[0].message.content;
    if (!thread) throw new Error("No content generated");

    // Clean up the thread format
    const cleanThread = thread
      .trim()
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .replace(/\n{3,}/g, '\n\n')      // Normalize line breaks
      .split('\n')
      .filter((tweet: string) => tweet.trim())    // Remove empty lines
      .map((tweet: string) => tweet.trim());

    return cleanThread;

  } catch (error: unknown) {
    console.error("Thread generation error:", error);
    if (error instanceof Error && error.message === 'Request timeout') {
      throw new Error("The request took too long. Please try again.");
    }
    throw new Error("Failed to generate thread. Please try again.");
  }
} 