import { useState, useEffect } from 'react';
import { Code, Eye, Download, Upload } from 'lucide-react';

interface HtmlEditorProps {
  html: string;
  onChange: (html: string) => void;
  onFileUpload: (content: string) => void;
}

export default function HtmlEditor({ html, onChange, onFileUpload }: HtmlEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showCode, setShowCode] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileUpload(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showCode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">Code</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showPreview
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Preview</span>
          </button>
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload</span>
            <input
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showCode && (
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200`}>
            <div className="bg-gray-800 px-4 py-2">
              <span className="text-xs font-medium text-gray-300">HTML</span>
            </div>
            <textarea
              value={html}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        )}

        {showPreview && (
          <div className={`${showCode ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-600">Preview</span>
            </div>
            <div className="flex-1 bg-white overflow-auto">
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
