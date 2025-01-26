import {ChatOpenAI} from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ProjectWithSkills } from '../app/types/supabase';
import { fetchProjects } from './projects';

const projectAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
Given a user query about projects and a list of projects with their skills, analyze and return the most relevant projects with tailored descriptions.

User Query: {query}

Projects:
{projects}

Instructions:
1. Analyze the query for key technologies, domains, or concepts
2. For each relevant project, tailor the description to emphasize aspects matching the query
3. Order skills by relevance to the query
4. Only include projects that are truly relevant to the query

Return the projects as a JSON array with this structure:

  "projects": 
    "id": "string",
    "title": "string",
    "description": "string",
    "github_url": "string",
    "live_url": "string",
    "skills": 
      "id": "string",
      "name": "string",
      "category": "string",
      "relevance_score": number
    ,
    "relevance_score": number
  


Remember to:
- Keep descriptions concise but informative
- Prioritize skills relevant to the query
- Score relevance from 0 to 1
`);

const outputParser = new JsonOutputParser();

export async function* analyzeProjectQuery(query: string) {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
    streaming: true,
  });

  try {
    // Fetch all projects from Supabase
    const projects = await fetchProjects();
    console.log("Projects fetched:",projects)
    // Format projects for the prompt
    const projectsText = projects.map(p => `
      Title: ${p.title}
      Description: ${p.description}
      Skills: ${p.skills.map(s => s.name).join(', ')}
      URLs: ${p.github_url || 'N/A'} | ${p.live_url || 'N/A'}
    `).join('\n\n');

    const chain = projectAnalysisPrompt.pipe(llm).pipe(outputParser);

    const response = await chain.invoke({ 
      query,
      projects: projectsText
    });
    console.log("Response:",response)

    // Stream each analyzed project
    for (const analyzedProject of response.projects) {
      // Find the original project to merge with analysis
      const originalProject = analyzedProject;
      if (originalProject) {
        console.log("Analyzed project:",analyzedProject)
        yield {
          type: 'project',
          data: {
            project: {
              ...originalProject,
              description: analyzedProject.description, // Use tailored description
              skills: analyzedProject.skills, // Use reordered skills
              relevance_score: analyzedProject.relevance_score
            }
          }
        };
      }
    }
  } catch (error) {
    yield {
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : 'Failed to analyze query'
      }
    };
  }
}
