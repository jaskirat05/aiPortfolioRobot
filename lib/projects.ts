import { supabase } from './supabase';
import { ProjectWithSkills, Skill } from '../app/types/supabase';

interface ProjectSkillJoin {
  skill_id: string;
  relevance_score: number;
  skills: {
    id: string;
    name: string;
    category: string;
  }[];
}

export async function fetchProjects() {
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');

  if (projectsError) throw projectsError;

  // Fetch skills for each project
  const projectsWithSkills = await Promise.all(
    projects.map(async (project) => {
      const { data: fetchedData, error: skillsError } = await supabase
        .from('project_skills')
        .select(`
          skill_id,
          relevance_score,
          skills (
            id,
            name,
            category
          )
        `)
        .eq('project_id', project.id);

      if (skillsError) throw skillsError;

      return {
        ...project,
        skills: (fetchedData as any[]).map(s => ({
          id: s.skill_id,
          name: s.skills[0]?.name || '',
          category: s.skills[0]?.category || '',
          relevance_score: s.relevance_score
        }))
      } as ProjectWithSkills;
    })
  );

  return projectsWithSkills;
}
