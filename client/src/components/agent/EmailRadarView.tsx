import React, { useState, useEffect } from 'react';
import { EmailAlertItem, AgentApiService } from '../../services/agentApi';
import {
  Mail,
  RefreshCw,
  Sparkles,
  Calendar,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  PlusCircle,
  Check,
  ExternalLink,
  ShieldAlert,
  Flame,
  PenSquare
} from 'lucide-react';

export function EmailRadarView() {
  const [alerts, setAlerts] = useState<EmailAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [sendingRealMail, setSendingRealMail] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [sendStatusMsg, setSendStatusMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'genuine' | 'all' | 'spam'>('genuine');

  // Outbound Real Email form state
  const [sendTo, setSendTo] = useState('vinaybethala9@gmail.com');
  const [sendSubject, setSendSubject] = useState('Hello from my AI Desktop Assistant!');
  const [sendBody, setSendBody] = useState(`Hi Vinay,\n\nThis is an automated test email sent directly from my personal AI Desktop Assistant running locally on my laptop!\n\nBest,\nSravs`);

  // Simulation form state
  const [simSender, setSimSender] = useState('recruiting@google.com');
  const [simSenderName, setSimSenderName] = useState('Jessica Miller (Google Staff Recruiter)');
  const [simSubject, setSimSubject] = useState('Interview Next Steps: Full Stack Software Engineer @ Google');
  const [simBody, setSimBody] = useState(`Hi Alex,\n\nOur hiring team was very impressed with your background and would like to schedule a 45-minute technical screen next Tuesday at 3:00 PM PST.\n\nPlease pick a slot on our scheduling portal: https://calendly.com/google-staff-eng/interview-alex\n\nLooking forward to speaking soon!`);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await AgentApiService.getEmailAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load email alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleScanNow = async () => {
    try {
      setScanning(true);
      await AgentApiService.scanEmails();
      await loadAlerts();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleSendRealEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingRealMail(true);
      setSendStatusMsg(null);
      const res = await AgentApiService.sendEmail(sendTo, sendSubject, sendBody);
      if (res.success) {
        setSendStatusMsg(`✅ Email successfully delivered to ${sendTo}!`);
        setTimeout(() => {
          setShowComposeModal(false);
          setSendStatusMsg(null);
        }, 3000);
      } else {
        setSendStatusMsg(`❌ Error: ${res.error || 'Failed to send'}`);
      }
    } catch (err: any) {
      setSendStatusMsg(`❌ Error: ${err.message}`);
    } finally {
      setSendingRealMail(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const created = await AgentApiService.simulateEmail({
        sender: simSender,
        senderName: simSenderName,
        subject: simSubject,
        body: simBody
      });
      setAlerts((prev) => [created, ...prev]);
      setShowSimModal(false);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await AgentApiService.markEmailRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const highUrgencyCount = alerts.filter((a) => a.urgency === 'high').length;
  const interviewCount = alerts.filter((a) => a.category === 'interview').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Mail className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">Smart Email Radar & Dispatcher</h1>
              {highUrgencyCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> {highUrgencyCount} High Priority
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Monitors your Gmail inbox, classifies recruiter inquiries & interview invitations, extracts meeting links and deadlines, and allows sending real outbound emails directly from your laptop.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
            >
              <PenSquare className="w-4 h-4" /> Compose & Send Real Email
            </button>
            <button
              onClick={() => setShowSimModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-purple-400" /> Test Inbound Radar
            </button>
            <button
              onClick={handleScanNow}
              disabled={scanning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning Inbox...' : 'Scan Inbox Now'}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Scanned Emails</span>
            <p className="text-xl font-bold text-white mt-0.5">{alerts.length}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5">
            <span className="text-xs text-emerald-400 font-medium">Interview Invitations</span>
            <p className="text-xl font-bold text-emerald-300 mt-0.5">{interviewCount}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5">
            <span className="text-xs text-amber-400 font-medium">Genuine Recruiter Mails</span>
            <p className="text-xl font-bold text-amber-300 mt-0.5">
              {alerts.filter((a) => a.category === 'recruiter' || a.category === 'offer').length}
            </p>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3.5">
            <span className="text-xs text-slate-400 font-medium">Spam / Ads Filtered</span>
            <p className="text-xl font-bold text-rose-400 mt-0.5">
              {alerts.filter((a) => a.category === 'spam' || (a.isGenuine === false && a.category !== 'interview')).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFilterType('genuine')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterType === 'genuine'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>🟢 Genuine Alerts & Interviews</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
            {alerts.filter(a => a.isGenuine === true || a.category === 'interview' || a.category === 'offer' || a.category === 'recruiter' || a.urgency === 'high').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterType === 'all'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Scanned ({alerts.length})
        </button>

        <button
          onClick={() => setFilterType('spam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            filterType === 'spam'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>🛡️ Filtered Spam / Marketing</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
            {alerts.filter(a => a.category === 'spam' || (a.isGenuine === false && a.category !== 'interview' && a.category !== 'offer')).length}
          </span>
        </button>
      </div>

      {/* Email Feed */}
      <div className="space-y-4">
        {alerts
          .filter(a => {
            if (filterType === 'genuine') return a.isGenuine === true || a.category === 'interview' || a.category === 'offer' || a.category === 'recruiter' || a.urgency === 'high';
            if (filterType === 'spam') return a.category === 'spam' || (a.isGenuine === false && a.category !== 'interview' && a.category !== 'offer');
            return true;
          })
          .slice(0, 50)
          .map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-5 transition relative shadow-lg ${
              alert.category === 'interview' || alert.category === 'offer' || alert.urgency === 'high'
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-500/5'
                : !alert.isRead
                ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-500/5'
                : 'bg-slate-900/50 border-slate-800 opacity-90'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                {/* Badges & Urgency */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      alert.category === 'interview'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : alert.category === 'offer'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : alert.category === 'recruiter'
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : alert.category === 'urgent_action'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : alert.category === 'spam'
                        ? 'bg-rose-950/30 text-rose-400 border-rose-800/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {alert.category === 'interview'
                      ? '🟢 INTERVIEW / ASSESSMENT'
                      : alert.category === 'offer'
                      ? '🎉 JOB OFFER'
                      : alert.category === 'recruiter'
                      ? '💼 RECRUITER REACHOUT'
                      : alert.category.toUpperCase()}
                  </span>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      alert.urgency === 'high'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                        : alert.urgency === 'medium'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Urgency: {alert.urgency.toUpperCase()}
                  </span>

                  {alert.triageReason && (
                    <span className="text-[11px] text-emerald-400/90 font-medium px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/20">
                      ✓ {alert.triageReason}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono ml-auto">
                    {new Date(alert.date).toLocaleString()}
                  </span>
                </div>

                {/* Subject & Sender */}
                <h3 className="text-base font-bold text-white tracking-tight">{alert.subject}</h3>
                <p className="text-xs text-slate-400">
                  From: <span className="text-slate-200 font-semibold">{alert.senderName || alert.sender}</span>
                </p>

                {/* AI Extracted Highlights Box */}
                {alert.extractedInfo && (
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mt-3 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> AI Actionable Intelligence
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {alert.extractedInfo.interviewDate && (
                        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5">
                          <Calendar className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span><strong>Time:</strong> {alert.extractedInfo.interviewDate}</span>
                        </div>
                      )}
                      {alert.extractedInfo.deadline && (
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5">
                          <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                          <span><strong>Deadline:</strong> {alert.extractedInfo.deadline}</span>
                        </div>
                      )}
                    </div>

                    {alert.extractedInfo.suggestedAction && (
                      <div className="text-xs text-slate-200">
                        <span className="text-slate-400 font-medium">Recommended Action: </span>
                        {alert.extractedInfo.suggestedAction}
                      </div>
                    )}

                    {alert.extractedInfo.interviewLink && (
                      <div className="pt-1">
                        <a
                          href={alert.extractedInfo.interviewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                        >
                          <Video className="w-3.5 h-3.5" /> Open Scheduling / Meeting Link <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Snippet preview */}
                <p className="text-xs text-slate-400 line-clamp-2 pt-1">{alert.snippet}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 lg:flex-col lg:items-end justify-end">
                {!alert.isRead ? (
                  <button
                    onClick={() => handleMarkRead(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5 text-purple-400" /> Mark Read
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-600" /> Read
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose & Send Real Outbound Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-indigo-400" /> Send Real Email via Gmail
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Sends an actual email from your connected address to any recipient directly from your laptop.
            </p>

            <form onSubmit={handleSendRealEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">To Recipient Email</label>
                <input
                  type="email"
                  required
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="recipient@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {sendStatusMsg && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
                  {sendStatusMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingRealMail}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingRealMail ? 'Sending Email...' : 'Send Email Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test / Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Test Inbound Email Triage & Toast
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Simulates receiving an email to test the AI classification and Windows Desktop Toast notification.
            </p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={simSenderName}
                  onChange={(e) => setSimSenderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sender Email</label>
                <input
                  type="text"
                  value={simSender}
                  onChange={(e) => setSimSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Body</label>
                <textarea
                  rows={4}
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {simulating ? 'Ingesting...' : 'Send Test Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
