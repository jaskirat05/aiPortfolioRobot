import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { fetchProjects } from '@/lib/projects';
import {analyzeProjectQuery} from '@/lib/langchain';
import { completionModel } from '@/lib/completionModel';

// Custom tool to fetch projects
export const dynamic = "force-dynamic";
let toolCallResponse:String|null=null
const projectTool=tool(
  
  async ({ query }) => {
    return query;
    
  },
  {
    name: "projectTool",
    schema: z.object({
      query: z.string(),
    }),
    description: "This wil fetch projects tailored to user query, this will serve as a prompt for anther AI chain so be detailed",
  }
) 
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  
});
const llmwithTools=llm.bindTools([projectTool])

import { NextApiResponse } from 'next';
import { IterableReadableStream } from '@langchain/core/utils/stream';

export async function POST(req: NextRequest) {
  const {query} = await req.json(); 
  if (!query) return new Response('Query is required', { status: 400 });
  // Create a streaming response
  const encoder = new TextEncoder();
  const streamingReadable=(message:string|IterableReadableStream<string>,streamType:string,projectFetcher:AsyncGenerator|null)=> new ReadableStream({
   async start(controller) {
    if (streamType=="PROJECT_STREAM" && projectFetcher) {
      console.log("Starting PROJECT_STREAM");

      try {
        for await (const result of projectFetcher) {
          const chunk = JSON.stringify(result);
          console.log("Sending project chunk:", chunk);
          controller.enqueue(encoder.encode(`data: ${streamType}:${chunk}\n\n`));
          messages.push(new AIMessage(chunk));
        
        }
        console.log("PROJECT_STREAM complete");
      
        const newMessage=await llmwithTools.pipe(parser).invoke(messages);
        {
          controller.enqueue(encoder.encode(`data: MESSAGE_STREAM:${newMessage}\n\n`))

        };
      } catch (error) {
        console.error("Error in PROJECT_STREAM:", error);
      }
      controller.close();
    }
    else if (streamType=="MESSAGE_STREAM") {
      if(typeof message === 'string') {
        console.log("Sending MESSAGE_STREAM",message);
     controller.enqueue(encoder.encode(`data: ${streamType}:${message}\n\n`));
     controller.close();
      }
      else if(message instanceof IterableReadableStream) {
        console.log("Sending MESSAGE_STREAM");
        for await (const message of messages) {
          controller.enqueue(encoder.encode(`data: ${streamType}:${message}\n\n`));
        }
        controller.close();
      }
     
    }
     
   },
 })

  //const {query}="Hello";
  
  const parser = new StringOutputParser();
  const systemMessage = new AIMessage(`
You are Jaskirat Singh, a Generative AI Engineer. Your role is to assist potential employers by answering questions about your background and projects.

PROFILE:
- Name: Jaskirat Singh
- Email: jaskirat055@gmail.com
-Phone : 647-671-7845
- Education: 
  * Master's Student at Toronto Metropolitan University
  * Completes Bachelor's in Computer Science from Guru Gobind Singh Indraprastha University in First Division Honors in 2016-2019
  * Also did a diploma in Sales and Tech Marketing from Lambton College in 2021-2023
  

INSTRUCTIONS:
1. When asked about projects, use the available tools to fetch project details
2. Provide a concise 2-3 line summary for each project, as the full details will be displayed separately
3. Maintain a professional yet conversational tone
4. Focus on highlighting technical skills and achievements
5. If asked about experience, relate it to relevant projects

Remember to be specific about your contributions and the technologies used in each project while keeping responses concise and engaging.
`);
  const messages=[systemMessage, new HumanMessage(query.toString())]

  const response=llmwithTools.invoke(messages);
  const finalResponse=await response
  messages.push(finalResponse)
  //messages.push(finalResponse)
  console.log(finalResponse)
  const toolCall = finalResponse.tool_calls && finalResponse.tool_calls.length > 0 
    ?projectTool.invoke(finalResponse.tool_calls[0]) 
    : null;
  if (toolCall) {
    const toolCallR=await toolCall
    toolCallResponse=toolCallR.content
    messages.push(toolCallR)
   
  
    
  }
  console.log("Tool call status:", !!toolCall);
  console.log("Tool call response:", toolCallResponse);
  
  let responseToReturn;
  if (toolCall !== null && toolCallResponse) {
    responseToReturn = streamingReadable("", "PROJECT_STREAM", analyzeProjectQuery(toolCallResponse.toString()));

  } else {
    responseToReturn = streamingReadable(finalResponse.content.toString(), "MESSAGE_STREAM", null);
  }
  
  return new Response(responseToReturn, {
    // Set the headers for Server-Sent Events (SSE)
    headers: {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
