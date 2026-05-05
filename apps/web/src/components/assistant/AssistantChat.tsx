'use client';

import { useState, useRef, useEffect } from 'react';
import { api, AssistantResponse } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantChat({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await api.assistant.chat(projectId, msg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao contactar o assistente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-navy-700 bg-navy-700/30">
      <div className="border-b border-navy-700 px-4 py-2">
        <h3 className="text-sm font-semibold">Assistente de Design</h3>
        <p className="text-xs text-navy-100">Fale em português — sugiro materiais, iluminação e câmaras</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
        {messages.length === 0 && (
          <p className="text-sm text-navy-100 italic">
            Experimente: &quot;quero madeira de carvalho na sala&quot; ou &quot;ajusta a luz para tarde&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-terracotta-500/30 text-white'
                : 'bg-navy-600 text-navy-50'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-navy-600 px-3 py-2 text-sm text-navy-100">A pensar...</div>
          </div>
        )}
      </div>

      <div className="border-t border-navy-700 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Escreva aqui..."
          className="flex-1 rounded border border-navy-600 bg-navy-700 px-3 py-2 text-sm text-white placeholder-navy-100 focus:border-terracotta-400 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-400 transition disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
