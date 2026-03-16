import { useState, useEffect } from 'react';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProjectsSidebar from './ProjectsSidebar';
import ChatInterface from './ChatInterface';
import HtmlEditor from './HtmlEditor';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Landing Page</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
    }
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 2rem;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.25rem;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>Welcome to Your Landing Page</h1>
      <p>Start chatting with AI to build your perfect page!</p>
    </div>
  </section>
</body>
</html>`;

export default function Builder() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrCreateProject();
    }
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [html]);

  const loadOrCreateProject = async () => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && projects && projects.length > 0) {
      setProjects(projects);

      const projectIdFromUrl = new URLSearchParams(window.location.search).get('project');
      const selectedProject = projects.find((project) => project.id === projectIdFromUrl) ?? projects[0];

      setCurrentProject(selectedProject);
      setHtml(selectedProject.html_content);
      updateProjectUrl(selectedProject.id);
    } else {
      await createNewProject();
    }
  };

  const updateProjectUrl = (projectId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    window.history.replaceState({}, '', url);
  };

  const generateProjectTitle = (existingProjects: Project[]) => {
    return `Project ${existingProjects.length + 1}`;
  };

  const createNewProject = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: generateProjectTitle(projects),
        html_content: DEFAULT_HTML,
      })
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => [data, ...prev]);
      setCurrentProject(data);
      setHtml(data.html_content);
      updateProjectUrl(data.id);
    }
  };

  const saveProject = async () => {
    if (!currentProject) return;

    setSaving(true);
    await supabase
      .from('projects')
      .update({
        html_content: html,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentProject.id);

    setProjects((prev) =>
      prev.map((project) =>
        project.id === currentProject.id
          ? {
              ...project,
              html_content: html,
              updated_at: new Date().toISOString(),
            }
          : project
      )
    );
    setSaving(false);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setHtml(project.html_content);
    updateProjectUrl(project.id);
  };

  const handleFileUpload = (content: string) => {
    setHtml(content);
  };

  if (!currentProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111315]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#ff6b3d]"></div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#aca18f]">Loading your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#111315] text-[#f3ead9]">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#1a1c21] px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="text-[2rem] font-black leading-none tracking-tight text-white">Q-coder</div>
          <div className="hidden text-[#71695d] md:block">/</div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-white/10 bg-[#111315] px-3 py-1 text-sm text-[#cabfae]">Personal</span>
            <span className="text-sm text-[#8f8576]">{currentProject.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#b7aa97]">
          <span className="hidden md:inline">Dashboard</span>
          <span className="rounded-full border border-[#3a2b24] bg-[#241913] px-3 py-1 text-[#ff8a63]">
            {currentProject.id.slice(0, 8)}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden p-3 md:p-4">
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#14161a] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <ProjectsSidebar
            projects={projects}
            selectedProjectId={currentProject.id}
            onSelectProject={handleSelectProject}
            onNewProject={createNewProject}
          />

          <div className="flex flex-1 flex-col overflow-hidden xl:flex-row">
            <div className="h-[18rem] border-b border-white/10 xl:h-auto xl:w-[25rem] xl:border-b-0 xl:border-r">
              <ChatInterface
                projectId={currentProject.id}
                currentHtml={html}
                onHtmlUpdate={setHtml}
              />
            </div>

            <div className="flex-1">
              <HtmlEditor
                html={html}
                onChange={setHtml}
                onFileUpload={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-full border border-[#3a2b24] bg-[#201611] px-4 py-2 text-sm text-[#ffd8ca] shadow-lg">
          Syncing changes...
        </div>
      )}
    </div>
  );
}
