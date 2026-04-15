import { Bot, Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function AIAssistant() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const initialPrompt = useMemo(
    () => `Give me an operational summary for my current fleet and tell me what needs action first.`,
    [],
  );

  const sendMessage = async messageText => {
    const value = (messageText || input).trim();
    if (!value || loading) return;
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: value }]);
    setInput('');
    setLoading(true);
    try {
      const response = await api.assistantChat(value);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: response.answer, cards: response.cards || [], suggestions: response.suggestions || [], generatedAt: response.generatedAt }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendMessage(initialPrompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Chatbot Assistant</h2>
              <p className="mt-1 text-sm text-slate-500">Operations-focused assistant grounded in your live assets, forecasts, work orders, alerts, and energy data.</p>
            </div>
            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              Advisory-only, explainable, and tied to backend platform data.
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="card p-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-600"><Bot size={20} /></div>
                  <div>
                    <h3 className="card-title">Assistant Conversation</h3>
                    <p className="muted">Ask about risks, failure forecasts, work orders, assets, or emissions.</p>
                  </div>
                </div>
                <button onClick={() => sendMessage('Give me an operational summary.')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Refresh summary
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`rounded-2xl p-4 ${message.role === 'assistant' ? 'border border-slate-200 bg-slate-50' : 'bg-brand-600 text-white'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                      {message.role === 'assistant' ? <Sparkles size={14} /> : null}
                      <span>{message.role === 'assistant' ? 'Assistant' : currentUser?.name || 'You'}</span>
                    </div>
                    <p className={`mt-3 text-sm leading-7 ${message.role === 'assistant' ? 'text-slate-700' : 'text-white'}`}>{message.text}</p>
                    {message.generatedAt ? <p className="mt-3 text-xs text-slate-400">Generated at {message.generatedAt}</p> : null}
                    {!!message.suggestions?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.suggestions.map(suggestion => (
                          <button key={suggestion} onClick={() => sendMessage(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Assistant is analysing the current platform data…</div> : null}
              </div>

              <div className="mt-4 flex items-end gap-3">
                <div className="flex-1">
                  <label className="label">Ask the assistant</label>
                  <textarea value={input} onChange={e => setInput(e.target.value)} className="input min-h-[110px] resize-none" placeholder="Example: Which assets are most likely to fail next, and do they already have work orders?" />
                </div>
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
                  <Send size={16} /> Send
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-5">
                <h3 className="card-title">Suggested prompts</h3>
                <div className="mt-4 space-y-3">
                  {[
                    'Which assets are most likely to fail next?',
                    'Show my overdue work orders.',
                    'Which sites have the highest emissions?',
                    'Summarise training and fatigue risks.',
                    'Tell me about asset BOI-101.',
                  ].map(prompt => (
                    <button key={prompt} onClick={() => sendMessage(prompt)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="card-title">Context cards</h3>
                <p className="muted mt-1">Cards returned by the assistant can take you directly to the relevant workflow.</p>
                <div className="mt-4 space-y-3">
                  {(messages.filter(message => message.role === 'assistant').at(-1)?.cards || []).map((card, index) => (
                    <button key={`${card.title}-${index}`} type="button" onClick={() => card.link && navigate(card.link)} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
                        </div>
                        <span className="text-sm font-bold text-brand-600">{card.value}</span>
                      </div>
                    </button>
                  ))}
                  {!(messages.filter(message => message.role === 'assistant').at(-1)?.cards || []).length ? <p className="text-sm text-slate-500">Ask a question to generate context-aware result cards.</p> : null}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
