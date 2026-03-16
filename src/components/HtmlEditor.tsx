import { useState } from 'react';
import { Code, Eye, Download, ImagePlus, Upload } from 'lucide-react';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target?.result as string;
      if (!imageSrc) return;

      const imageMarkup = `
  <figure style="margin: 2rem 0; text-align: center;">
    <img src="${imageSrc}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 18px;" />
  </figure>`;

      if (html.includes('</body>')) {
        onChange(html.replace('</body>', `${imageMarkup}
</body>`));
      } else {
        onChange(`${html}${imageMarkup}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    <div className="flex h-full flex-col bg-[#14161a]">
      <div className="flex flex-col gap-3 border-b border-white/10 bg-[#181a1f] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 transition ${
              showCode
                ? 'bg-[#241913] text-[#ff9b7a]'
                : 'border border-white/10 bg-[#111315] text-[#c9bdaa] hover:bg-[#17191d]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">Code</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 transition ${
              showPreview
                ? 'bg-[#241913] text-[#ff9b7a]'
                : 'border border-white/10 bg-[#111315] text-[#c9bdaa] hover:bg-[#17191d]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Preview</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111315] px-4 py-2 text-[#c9bdaa] transition hover:bg-[#17191d]"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {showCode && (
          <div className={`${showPreview ? 'lg:w-1/2' : 'w-full'} flex min-h-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r`}>
            <div className="bg-[#121419] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f8576]">HTML</span>
            </div>
            <textarea
              value={html}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 resize-none bg-[#0f1115] p-4 font-mono text-sm text-[#f2e7d6] focus:outline-none"
              spellCheck={false}
            />
            <div className="flex justify-end gap-2 border-t border-white/10 bg-[#121419] px-4 py-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-[#111315] px-4 py-2 text-[#c9bdaa] transition hover:bg-[#17191d]">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload</span>
                <input
                  type="file"
                  accept=".html"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-[#111315] px-4 py-2 text-[#c9bdaa] transition hover:bg-[#17191d]">
                <ImagePlus className="w-4 h-4" />
                <span className="text-sm font-medium">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {showPreview && (
          <div className={`${showCode ? 'lg:w-1/2' : 'w-full'} flex min-h-0 flex-col`}>
            <div className="border-b border-white/10 bg-[#181a1f] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f8576]">Preview</span>
            </div>
            <div className="flex-1 overflow-auto bg-[#111315] p-3">
              <iframe
                srcDoc={html}
                className="h-full w-full rounded-[20px] border border-white/10 bg-white"
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
