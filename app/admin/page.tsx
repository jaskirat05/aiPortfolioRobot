import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProjects, checkStorageAvailability } from './action';
import ProjectsClient from './components/ProjectsClient';

export const metadata = {
  title: 'Admin | Project Management',
  description: 'Manage your client projects',
};

export default async function AdminPage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  try {
    const projects = await getProjects();
    const storage = await checkStorageAvailability();
  
    if (!storage.available) {
      console.warn('Supabase Storage is not available:', storage.error);
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <ProjectsClient initialProjects={projects} />
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300">Failed to load projects. Please try again later.</p>
        </div>
      </div>
    );
  }
}
