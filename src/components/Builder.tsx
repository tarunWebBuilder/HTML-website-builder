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
      .limit(1);

    if (!error && projects && projects.length > 0) {
      setCurrentProject(projects[0]);
      setHtml(projects[0].html_content);
    } else {
      createNewProject();
    }
  };

  const createNewProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user!.id,
        title: `Project ${new Date().toLocaleDateString()}`,
        html_content: DEFAULT_HTML,
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentProject(data);
      setHtml(data.html_content);
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
    setSaving(false);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setHtml(project.html_content);
  };

  const handleFileUpload = (content: string) => {
    setHtml(content);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ProjectsSidebar
        selectedProjectId={currentProject.id}
        onSelectProject={handleSelectProject}
        onNewProject={createNewProject}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 border-r border-gray-200">
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

      {saving && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Saving...
        </div>
      )}
    </div>
  );
}
