
 
import { OpenAI } from "@langchain/openai";
 
export const completionModel = (
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) =>
  new OpenAI({
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          controller.enqueue(encoder.encode(`data: ${token}\n\n`));
        },
        async handleLLMEnd(output) {
          controller.close();
        },
      },
    ],
  });