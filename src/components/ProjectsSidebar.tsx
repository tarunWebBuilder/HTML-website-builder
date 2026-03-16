import { Plus, FileText, LogOut } from 'lucide-react';
import { Project } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProjectsSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export default function ProjectsSidebar({ projects, selectedProjectId, onSelectProject, onNewProject }: ProjectsSidebarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="hidden w-72 border-r border-white/10 bg-[#1b1d22] lg:flex lg:flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#131519] px-4 py-3">
          <div className="h-10 w-10 rounded-2xl bg-[#f5e9d7] p-2 text-[#111315]">
            <FileText className="h-full w-full" />
          </div>
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f6eedf]">Workspace</h1>
            <p className="text-xs text-[#8f8576]">HTML Builder AI</p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="w-full rounded-2xl bg-[#f5e9d7] px-4 py-3 text-sm font-semibold text-[#111315] transition hover:bg-white"
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            New Project
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8f8576]">
          Projects
        </div>
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedProjectId === project.id
                  ? 'border-[#5a3427] bg-[#241913]'
                  : 'border-transparent bg-transparent hover:border-white/10 hover:bg-[#15171c]'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    selectedProjectId === project.id ? 'text-[#ff8a63]' : 'text-[#686154]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${
                    selectedProjectId === project.id ? 'text-[#f6eedf]' : 'text-[#d8ceb9]'
                  }`}>
                    {project.title}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#7d7568]">
                    {project.id.slice(0, 8)}
                  </p>
                  <p className="mt-2 text-xs text-[#9a8f7f]">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-[#c9bdaa] transition hover:bg-[#15171c] hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
