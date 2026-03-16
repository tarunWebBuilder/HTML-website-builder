import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase, ChatMessage } from '../lib/supabase';

interface ChatInterfaceProps {
  projectId: string;
  currentHtml: string;
  onHtmlUpdate: (html: string) => void;
}

export default function ChatInterface({ projectId, currentHtml, onHtmlUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ project_id: projectId, role, content })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    await saveMessage('user', userMessage);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mistral-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMessage }
            ],
            currentHtml
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = data.message;
      await saveMessage('assistant', assistantMessage);

      if (assistantMessage.includes('<!DOCTYPE html>') || assistantMessage.includes('<html')) {
        const htmlMatch = assistantMessage.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
        if (htmlMatch) {
          onHtmlUpdate(htmlMatch[0]);
        } else {
          onHtmlUpdate(assistantMessage);
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      await saveMessage('assistant', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#181a1f]">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8f8576]">Assistant</p>
            <p className="mt-1 text-sm text-[#d8ceb9]">Describe what you want to build.</p>
          </div>
          <div className="rounded-full border border-[#3a2b24] bg-[#241913] px-3 py-1 text-xs text-[#ff8a63]">
            Live
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#121419] p-6 text-center text-[#9c907f]">
            <p className="mb-2 text-lg font-medium text-[#f6eedf]">Start a conversation</p>
            <p className="text-sm">Ask AI to create or modify your HTML landing page.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[#f5e9d7] text-[#111315]'
                  : 'border border-white/10 bg-[#121419] text-[#e5dac8]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-[#121419] px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#ff8a63]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your landing page..."
            className="flex-1 rounded-2xl border border-white/10 bg-[#111315] px-4 py-3 text-[#f6eedf] outline-none transition focus:border-[#ff6b3d]/60 focus:ring-2 focus:ring-[#ff6b3d]/20"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-2xl bg-[#f5e9d7] p-3 text-[#111315] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
