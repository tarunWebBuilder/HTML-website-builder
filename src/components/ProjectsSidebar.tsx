import { useState, useEffect } from 'react';
import { Plus, FileText, LogOut } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProjectsSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export default function ProjectsSidebar({ selectedProjectId, onSelectProject, onNewProject }: ProjectsSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { signOut } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-1">HTML Builder AI</h1>
        <p className="text-xs text-gray-600">Create with Mistral AI</p>
      </div>

      <div className="p-4">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                selectedProjectId === project.id
                  ? 'bg-blue-50 border-2 border-blue-600'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              <FileText className={`w-5 h-5 flex-shrink-0 ${
                selectedProjectId === project.id ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  selectedProjectId === project.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {project.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
