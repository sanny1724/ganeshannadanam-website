import React, { useState, useEffect } from 'react';
import { AgentSettingsData, AgentApiService } from '../../services/agentApi';
import {
  Sliders,
  Key,
  Mail,
  Bell,
  CheckCircle,
  Save,
  Volume2,
  Monitor,
  Sparkles,
  Info
} from 'lucide-react';

export function AgentSettingsView() {
  const [settings, setSettings] = useState<AgentSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await AgentApiService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await AgentApiService.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setTestingNotification(true);
      const res = await AgentApiService.testNotification();
      setToastMessage(res.message || 'Notification triggered on your laptop!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Error: ${err.message}`);
    } finally {
      setTestingNotification(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading Agent Settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">Agent Configuration & Alerts</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Configure LLM intelligence providers, email IMAP connections, and Windows Toast alert thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LLM & AI Engine Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Key className="w-4 h-4" /> AI Brain / LLM Credentials
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">AI Provider</label>
            <select
              value={settings.aiProvider}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini">Google Gemini (Recommended / Free tier supported)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="mock">Local Smart Heuristics (Offline fallback)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Gemini API Key</label>
            <input
              type="password"
              value={settings.geminiApiKey}
              onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">OpenAI API Key (Optional)</label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>If an API key is not provided, the agent uses local heuristic parsing so you can test all features offline.</span>
          </div>
        </div>

        {/* Windows Notifications Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Windows Desktop Notifications
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-200 font-medium flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" /> Enable Windows Desktop Toast Popups
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.desktopToast}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, desktopToast: e.target.checked }
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-200 font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" /> Play Sound on High Priority Alert
              </span>
              <input
                type="checkbox"
                checked={settings.notifications.soundEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, soundEnabled: e.target.checked }
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
              />
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Minimum Alert Urgency for Toast</label>
              <select
                value={settings.notifications.minUrgencyForToast}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      minUrgencyForToast: e.target.value as any
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="high">High Urgency Only (Interviews & Offers)</option>
                <option value="medium">Medium & Above (Interviews, Offers, Action Required)</option>
                <option value="low">All Alerts (Including General updates)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testingNotification}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Bell className="w-4 h-4 text-indigo-400" />
                {testingNotification ? 'Sending Toast...' : 'Test Windows Toast on My Laptop'}
              </button>
              {toastMessage && (
                <p className="text-xs text-emerald-400 text-center mt-2 font-medium">{toastMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Email IMAP Credentials */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> IMAP Email Ingestion (Gmail / Outlook / iCloud)
            </h2>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailConfig.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, enabled: e.target.checked }
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
              />
              <span>Enable Background Scanner</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IMAP Host</label>
              <input
                type="text"
                value={settings.emailConfig.host}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, host: e.target.value }
                  })
                }
                placeholder="imap.gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Port</label>
              <input
                type="number"
                value={settings.emailConfig.port}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, port: Number(e.target.value) }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email / Username</label>
              <input
                type="text"
                value={settings.emailConfig.user}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, user: e.target.value }
                  })
                }
                placeholder="your.email@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">App Password</label>
              <input
                type="password"
                value={settings.emailConfig.pass}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, pass: e.target.value }
                  })
                }
                placeholder="Gmail App Password (16 chars)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Check Frequency (Minutes)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.emailConfig.checkIntervalMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emailConfig: { ...settings.emailConfig, checkIntervalMinutes: Number(e.target.value) }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
