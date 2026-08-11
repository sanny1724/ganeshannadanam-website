import React, { useState } from 'react';
import { AgentApiService } from '../../services/agentApi';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Clock,
  Briefcase,
  Mail,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Which companies have contacted me?',
  'Do I have any assessments pending?',
  'Which applications haven’t received a response?',
  'Show jobs with match score above 80',
  'How many applications did I submit this week?',
  'Show me upcoming interviews'
];

export function AIAssistantChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 **Hello! I am your AI Career & Email Assistant.**\n\nI continuously monitor your job pipeline and email communications for **B Sannith Reddy**.\n\nYou can ask me anything about pending assessments, upcoming interviews, recruiter reachouts, or application statistics!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await AgentApiService.queryAI(text);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Error fetching response: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-400" />
            AI Career & Email Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Query your real-time job applications, recruiter emails, and assessment deadlines using natural language.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Intelligence Active
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Quick Questions:
        </span>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-xs font-medium transition disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 min-h-[480px] max-h-[600px] overflow-y-auto space-y-4 flex flex-col shadow-2xl">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-bold text-slate-400">
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">{msg.timestamp}</span>
            </div>
            <div
              className={`p-4 rounded-3xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap shadow-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl w-fit">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Analyzing pipeline & email alerts...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 pl-4 shadow-xl">
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything (e.g. Do I have any pending assessments? Which companies rejected me?)"
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition disabled:opacity-40 shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
