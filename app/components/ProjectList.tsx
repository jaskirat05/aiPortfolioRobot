'use client';

import Link from 'next/link';
import { FiFolder, FiClock, FiGitBranch, FiSearch, FiFilter } from 'react-icons/fi';
import { useState, useMemo } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  github_url?: string;
}

interface ProjectListProps {
  projects: Project[];
  organizationId: string;
}

export function ProjectList({ projects, organizationId }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const statuses = ['all', ...new Set(projects.map(p => p.status))];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/organization/${organizationId}/projects/${project.id}`}
            className="block"
          >
            <div className="bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <FiFolder className="h-6 w-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white truncate">
                    {project.name}
                  </h3>
                </div>

                <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <FiClock className="mr-1.5 h-4 w-4" />
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {project.github_url && (
                    <div className="flex items-center">
                      <FiGitBranch className="mr-1.5 h-4 w-4" />
                      <span>GitHub</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <div className="flex justify-center">
            <FiFolder className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-400">
            {projects.length === 0 ? 'No projects found' : 'No matching projects'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length === 0 
              ? 'Get started by creating a new project.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      )}
    </div>
  );
}
