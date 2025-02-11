'use server';

interface OrganizationExport {
  id: string;
  name: string;
}
import { createClient } from '@supabase/supabase-js';
import { auth, clerkClient, Organization } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export interface Project {
  id: string;
  name: string;
  description?: string;
  design_link?: string;
  github_link?: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  clerk_organization_id: string;
  clerk_user_id: string;
  assigned_to_org_id?: string;
  assigned_admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClerkOrganization {
  id?: string;
  name?: string;
  slug?: string;
}

export interface ClerkUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  project_id: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectIssue {
  id: string;
  project_id: string;
  content: string;
  status: 'open' | 'resolved' | 'in_progress' | 'exception';
  resolution_notes?: string;
  client_input_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getOrganizations() {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const organizations = await client.organizations.getOrganizationList();
    return organizations.data.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
    })) as OrganizationExport[];
  } catch (error) {
    console.error('Clerk error:', error);
    throw new Error('Failed to fetch organizations');
  }
}

export async function getOrg(id: string): Promise<OrganizationExport | null> {
  try {
    const client = await clerkClient();
    const selectedOrg = await client.organizations.getOrganizationList();
    const org = selectedOrg.data.find((org) => org.id === id);
    
    if (!org) {
      return null;
    }

    // Return a plain object with only the needed properties
    return {
      id: org.id,
      name: org.name,
      
    };
  } catch(error) {
    console.error('Clerk error:', error);
    return null;
  }
}

export async function getUser(id:string){
  const client = await clerkClient();
  try{
    const userDetail = await client.users.getUser(id);
    return ({
      id: userDetail.id,
      firstName: userDetail.firstName,
      lastName: userDetail.lastName,
      email: userDetail.emailAddresses[0]?.emailAddress,
      imageUrl: userDetail.imageUrl,
    }) as ClerkUser;
  }
  catch(error){
    console.error('Clerk error:', error);
    throw new Error('Failed to fetch user');
  }

}

export async function searchUsers(query: string) {
  const { userId } = await auth();
  const client = await clerkClient();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  try {
    const users = await client.users.getUserList({
      query,
      limit: 10,
    });
    console.log(users);
    return users.data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
    })) as ClerkUser[];
  } catch (error) {
    console.error('Clerk error:', error);
    throw new Error('Failed to search users');
  }
}

export async function getProjects() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('client_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return data as Project[];
}

export async function createProject(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const project = {
    name: formData.get('name'),
    description: formData.get('description'),
    design_link: formData.get('design_link'),
    github_link: formData.get('github_link'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    budget: formData.get('budget') ? Number(formData.get('budget')) : null,
    clerk_organization_id: formData.get('assigned_to_org_id'),
    clerk_user_id: formData.get('assigned_admin_id'),
  };

  const { error } = await supabase
    .from('client_projects')
    .insert([project]);

  if (error) {
    console.error('Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to create project: ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function updateProject(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id');
  const project = {
    name: formData.get('name'),
    description: formData.get('description'),
    design_link: formData.get('design_link'),
    github_link: formData.get('github_link'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    budget: formData.get('budget') ? Number(formData.get('budget')) : null,
    clerk_organization_id: formData.get('assigned_to_org_id'),
    clerk_user_id: formData.get('assigned_admin_id'),
  };

  const { error } = await supabase
    .from('client_projects')
    .update(project)
    .eq('id', id);

  if (error) {
    console.error('Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function deleteProject(id: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('client_projects')
    .delete()
    .eq('id', id)
    .eq('clerk_organization_id', orgId);

  if (error) {
    console.error('Supabase error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath('/admin');
}

export async function checkStorageAvailability() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Storage error:', error);
      return { available: false, error: error.message };
    }

    return { available: true, buckets };
  } catch (error) {
    console.error('Storage error:', error);
    return { available: false, error: 'Storage not available' };
  }
}

export async function uploadProjectFile(projectId: string, file: File, fileName: string) {
  try {
    // 1. Upload file to storage with project-specific path
    const storagePath = `${projectId}/${fileName}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('project-files')
      .upload(storagePath, file);

    if (storageError) {
      throw storageError;
    }

    // 2. Create database entry
    const { data: fileData, error: dbError } = await supabase
      .from('project_files')
      .insert({
        name: fileName,
        size: file.size,
        type: file.type,
        project_id: projectId,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage
        .from('project-files')
        .remove([storagePath]);
      throw dbError;
    }

    return fileData;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getProjectFiles(projectId: string) {
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching project files:', error);
    throw error;
  }

  return data as ProjectFile[];
}

export async function deleteProjectFile(fileId: string, storagePath: string) {
  try {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }

    // 2. Delete database entry
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getFileUrl(storagePath: string) {
  const { data } = await supabase.storage
    .from('project-files')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function addProjectUpdate(projectId: string, content: string) {
  const { data, error } = await supabase
    .from('project_updates')
    .insert({
      project_id: projectId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectUpdates(projectId: string) {
  const { data, error } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ProjectUpdate[];
}

export async function addProjectIssue(projectId: string, content: string) {
  const { data, error } = await supabase
    .from('project_issues')
    .insert({
      project_id: projectId,
      content,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectIssues(projectId: string) {
  const { data, error } = await supabase
    .from('project_issues')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ProjectIssue[];
}

export async function updateIssueStatus(
  issueId: string, 
  status: 'open' | 'resolved' | 'in_progress' | 'exception',
  notes?: string,
  isClientInputNotes: boolean = false
) {
  const updateData: { 
    status: string; 
    resolution_notes?: string;
    client_input_notes?: string;
  } = { status };
  
  if (notes) {
    if (isClientInputNotes) {
      updateData.client_input_notes = notes;
    } else {
      updateData.resolution_notes = notes;
    }
  }

  const { data, error } = await supabase
    .from('project_issues')
    .update(updateData)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
