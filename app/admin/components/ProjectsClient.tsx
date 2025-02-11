'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiUpload, FiDownload, FiX, FiCheck, FiClock } from 'react-icons/fi';
import { Project, createProject, updateProject, deleteProject, uploadProjectFile, getProjectFiles, deleteProjectFile, getFileUrl, ProjectFile, ProjectUpdate, ProjectIssue, addProjectUpdate, getProjectUpdates, addProjectIssue, getProjectIssues, updateIssueStatus, getOrg, getUser } from '../action';
import { useRouter } from 'next/navigation';
import { ComboboxSelect } from '../components/ComboboxSelect'; // Import ComboboxSelect component
import { getOrganizations, searchUsers } from '../action'; // Import API functions

interface ProjectsClientProps {
  initialProjects: Project[];
}

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

export default function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isClientInputModalOpen, setIsClientInputModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [projectIssues, setProjectIssues] = useState<ProjectIssue[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ProjectIssue | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      if (editingProject) {
        formData.append('id', editingProject.id);
        await updateProject(formData);
      } else {
        await createProject(formData);
      }
      
      setIsModalOpen(false);
      setEditingProject(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const openEditModal = async (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);

    const selectedOrg = await getOrg(project.clerk_organization_id);
    const selectedUser = await getUser(project.clerk_user_id);

    if (selectedOrg) {
      setSelectedOrg(selectedOrg);
    }
    
    if (selectedUser) {
      setSelectedUser(selectedUser);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!editingProject) {
      alert('No project selected');
      return;
    }

    try {
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput.files?.[0];
      const fileName = formData.get('fileName') as string;

      if (!file || !fileName) {
        alert('Please select a file and provide a name');
        return;
      }

      // Upload the file
      const fileData = await uploadProjectFile(editingProject.id, file, fileName);
      
      // Refresh the file list
      const updatedFiles = await getProjectFiles(editingProject.id);
      setProjectFiles(updatedFiles);
      
      setIsUploadModalOpen(false);
      setUploadProgress(0);
      router.refresh();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteProjectFile(fileId, storagePath);
      const updatedFiles = await getProjectFiles(editingProject!.id);
      setProjectFiles(updatedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const loadProjectFiles = async (projectId: string) => {
    try {
      const files = await getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (error) {
      console.error('Error loading project files:', error);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!editingProject) return;

    try {
      const content = formData.get('content') as string;
      await addProjectUpdate(editingProject.id, content);
      const updates = await getProjectUpdates(editingProject.id);
      setProjectUpdates(updates);
      setIsUpdateModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update. Please try again.');
    }
  };

  const handleAddIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!editingProject) return;

    try {
      const content = formData.get('content') as string;
      await addProjectIssue(editingProject.id, content);
      const issues = await getProjectIssues(editingProject.id);
      setProjectIssues(issues);
      setIsIssueModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding issue:', error);
      alert('Failed to add issue. Please try again.');
    }
  };

  const handleStatusChange = async (issue: ProjectIssue, newStatus: string) => {
    if (newStatus === 'resolved') {
      setSelectedIssue(issue);
      setIsResolutionModalOpen(true);
    } else if (newStatus === 'exception') {
      setSelectedIssue(issue);
      setIsClientInputModalOpen(true);
    } else {
      await handleUpdateIssueStatus(issue.id, newStatus as any);
    }
  };

  const handleUpdateIssueStatus = async (
    issueId: string, 
    status: 'open' | 'resolved' | 'in_progress' | 'exception',
    notes?: string,
    isClientInputNotes: boolean = false
  ) => {
    try {
      await updateIssueStatus(issueId, status, notes, isClientInputNotes);
      const issues = await getProjectIssues(editingProject!.id);
      setProjectIssues(issues);
      setIsResolutionModalOpen(false);
      setIsClientInputModalOpen(false);
      setSelectedIssue(null);
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Failed to update issue status. Please try again.');
    }
  };

  // Load project data when a project is selected
  useEffect(() => {
    if (editingProject) {
      loadProjectFiles(editingProject.id);
      getProjectUpdates(editingProject.id).then(setProjectUpdates);
      getProjectIssues(editingProject.id).then(setProjectIssues);
    } else {
      setProjectFiles([]);
      setProjectUpdates([]);
      setProjectIssues([]);
    }
  }, [editingProject]);

  return (
    <div className="flex min-h-screen">
      {/* Project List Sidebar */}
      <div className="w-1/5 bg-gray-900 p-4 border-r border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="New project"
          >
            <FiPlus />
          </button>
        </div>

        {/* Project List */}
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer group"
              onClick={() => setEditingProject(project)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-400 truncate max-w-[200px]">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(project);
                    }}
                    className="text-gray-400 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit project"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete project"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                  ${project.status === 'completed' ? 'bg-green-900 text-green-300' : 
                    project.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                    project.status === 'planning' ? 'bg-yellow-900 text-yellow-300' :
                    project.status === 'on_hold' ? 'bg-gray-700 text-gray-300' :
                    'bg-purple-900 text-purple-300'}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full
                  ${project.priority === 'urgent' ? 'bg-red-900 text-red-300' :
                    project.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                    project.priority === 'medium' ? 'bg-blue-900 text-blue-300' :
                    'bg-green-900 text-green-300'}`}>
                  {project.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto pb-8">
          <h2 className="text-2xl font-bold text-white mb-8">Project Details</h2>
          {editingProject ? (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">{editingProject.name}</h3>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-300">{editingProject.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Status</h4>
                      <p className="text-white">{editingProject.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Priority</h4>
                      <p className="text-white">{editingProject.priority}</p>
                    </div>
                    {editingProject.budget && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Budget</h4>
                        <p className="text-white">${editingProject.budget}</p>
                      </div>
                    )}
                  </div>
                  {/* Files Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Files</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      {projectFiles.length > 0 ? (
                        <div className="space-y-2">
                          {projectFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-300">{file.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({Math.round(file.size / 1024)}KB)
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <a
                                  href={getFileUrl(file.storage_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                  title="Download file"
                                >
                                  <FiDownload className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(file.id, file.storage_path)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete file"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center">No files uploaded yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Updates Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Updates</h3>
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Update
                  </button>
                </div>
                <div className="space-y-4">
                  {projectUpdates.map((update) => (
                    <div key={update.id} className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-300">{update.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(update.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {projectUpdates.length === 0 && (
                    <p className="text-gray-400 text-center">No updates yet</p>
                  )}
                </div>
              </div>

              {/* Issues Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Issues</h3>
                  <button
                    onClick={() => setIsIssueModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Issue
                  </button>
                </div>
                <div className="space-y-4">
                  {projectIssues.map((issue) => (
                    <div key={issue.id} className="bg-gray-900 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-300">{issue.content}</p>
                          {issue.resolution_notes && (
                            <p className="text-sm text-gray-400 mt-2">
                              Resolution: {issue.resolution_notes}
                            </p>
                          )}
                          {issue.client_input_notes && (
                            <p className="text-sm text-gray-400 mt-2">
                              Needed from client: {issue.client_input_notes}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(issue.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue, e.target.value)}
                            className="bg-gray-700 text-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="exception">Needs Client Input</option>
                          </select>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            issue.status === 'resolved' ? 'bg-green-900 text-green-300' :
                            issue.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                            issue.status === 'exception' ? 'bg-purple-900 text-purple-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {issue.status === 'exception' ? 'Needs Input' : issue.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projectIssues.length === 0 && (
                    <p className="text-gray-400 text-center">No issues reported</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center mt-20">
              Select a project from the sidebar to view details
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProject?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProject?.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Design Link</label>
                  <input
                    type="url"
                    name="design_link"
                    defaultValue={editingProject?.design_link}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">GitHub Link</label>
                  <input
                    type="url"
                    name="github_link"
                    defaultValue={editingProject?.github_link}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                  />
                </div>
                <div>
                  <input hidden name="id" defaultValue={editingProject?.id} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProject?.status || 'planning'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Priority</label>
                  <select
                    name="priority"
                    defaultValue={editingProject?.priority || 'medium'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Budget</label>
                  <input
                    type="number"
                    name="budget"
                    defaultValue={editingProject?.budget}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Organization Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">Assign to Organization</label>
                  <ComboboxSelect
                    items={organizations}
                    value={selectedOrg}
                    onChange={setSelectedOrg}
                    displayValue={(org) => org?.name || ''}
                    onSearch={async (query) => {
                      const orgs = await getOrganizations();
                      setOrganizations(orgs);
                    }}
                    name="assigned_to_org_id"
                  >
                    {(org) => (
                      <div className="flex items-center gap-2 p-2">
                        <span>{org.name}</span>
                      </div>
                    )}
                  </ComboboxSelect>
                </div>

                {/* Admin Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">Assign to Admin</label>
                  <ComboboxSelect
                    items={users}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    displayValue={(user) => user ? `${user.firstName} ${user.lastName}` : ''}
                    onSearch={async (query) => {
                      const results = await searchUsers(query);
                      setUsers(results);
                    }}
                    name="assigned_admin_id"
                  >
                    {(user) => (
                      <div className="flex items-center gap-2 p-2">
                        <img src={user.imageUrl} alt="" className="w-6 h-6 rounded-full" />
                        <div>
                          <div>{`${user.firstName} ${user.lastName}`}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    )}
                  </ComboboxSelect>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                    }}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                Upload File
              </h3>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">File Name</label>
                  <input
                    type="text"
                    name="fileName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">File</label>
                  <input
                    type="file"
                    name="file"
                    className="mt-1 block w-full text-sm text-gray-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-600 file:text-white
                      hover:file:bg-indigo-700
                      file:cursor-pointer"
                    required
                  />
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-indigo-300">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setUploadProgress(0);
                    }}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    disabled={uploadProgress > 0}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                Add Update
              </h3>
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Update Content</label>
                  <textarea
                    name="content"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                Report Issue
              </h3>
              <form onSubmit={handleAddIssue} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Issue Description</label>
                  <textarea
                    name="content"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Notes Modal */}
      {isResolutionModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                Add Resolution Notes
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                handleUpdateIssueStatus(
                  selectedIssue.id,
                  'resolved',
                  formData.get('resolution_notes') as string
                );
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Resolution Notes</label>
                  <textarea
                    name="resolution_notes"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResolutionModalOpen(false);
                      setSelectedIssue(null);
                    }}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit Resolution
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Client Input Modal */}
      {isClientInputModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900 border-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-300 mb-4">
                What do you need from the client?
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                handleUpdateIssueStatus(
                  selectedIssue.id,
                  'exception',
                  formData.get('client_input_notes') as string,
                  true
                );
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Required Information</label>
                  <textarea
                    name="client_input_notes"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-800 text-gray-300"
                    required
                    placeholder="Describe what information you need from the client..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientInputModalOpen(false);
                      setSelectedIssue(null);
                    }}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
