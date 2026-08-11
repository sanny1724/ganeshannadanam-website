import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, AgentApiService } from '../../services/agentApi';
import {
  User,
  FileText,
  Briefcase,
  CheckCircle,
  Save,
  Plus,
  X,
  Shield,
  UploadCloud,
  HelpCircle,
  Sparkles,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export function ProfileVaultView() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newQKey, setNewQKey] = useState('');
  const [newQAns, setNewQAns] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await AgentApiService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadStatus('❌ Please select a valid PDF file.');
      return;
    }

    try {
      setUploadingPdf(true);
      setUploadStatus('⏳ Reading and parsing PDF contents with AI...');
      const res = await AgentApiService.uploadResumePdf(file);
      setProfile(res.profile);
      setUploadStatus(`✅ PDF Resume parsed successfully! (${res.pages} page(s), ${res.discoveredSkills.length} skills auto-detected)`);
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (err: any) {
      setUploadStatus(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      const updated = await AgentApiService.updateProfile(profile);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !profile) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill)
    });
  };

  const handleAddCustomAnswer = () => {
    if (!newQKey.trim() || !newQAns.trim() || !profile) return;
    setProfile({
      ...profile,
      customAnswers: {
        ...profile.customAnswers,
        [newQKey.trim()]: newQAns.trim()
      }
    });
    setNewQKey('');
    setNewQAns('');
  };

  const handleRemoveCustomAnswer = (key: string) => {
    if (!profile) return;
    const updated = { ...profile.customAnswers };
    delete updated[key];
    setProfile({
      ...profile,
      customAnswers: updated
    });
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading Profile Knowledge Vault...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Shield className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">Candidate Profile & Knowledge Vault</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              The AI Agent references this knowledge base to generate authentic cover letters and answer recruiter questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Changes Saved!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Vault Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Resume Uploader Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" /> Upload Your PDF Resume
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Upload your PDF resume file. The AI Assistant will automatically extract your work history, education, projects, and technical skills into the Knowledge Vault.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPdf}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${uploadingPdf ? 'animate-bounce' : ''}`} />
              {uploadingPdf ? 'Parsing PDF File...' : 'Choose PDF Resume File'}
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs font-medium text-indigo-200 animate-fadeIn">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Grid: Personal & Work Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Candidate Details */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <User className="w-4 h-4" /> Contact & Professional Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={profile.linkedinUrl}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">🇮🇳 Naukri.com Profile URL</label>
              <input
                type="text"
                placeholder="https://www.naukri.com/mnjuser/profile..."
                value={profile.naukriUrl || ''}
                onChange={(e) => setProfile({ ...profile, naukriUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Indeed Profile URL</label>
                <input
                  type="text"
                  placeholder="https://profile.indeed.com/..."
                  value={profile.indeedUrl || ''}
                  onChange={(e) => setProfile({ ...profile, indeedUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Glassdoor Profile URL</label>
                <input
                  type="text"
                  placeholder="https://www.glassdoor.co.in/member/profile/..."
                  value={profile.glassdoorUrl || ''}
                  onChange={(e) => setProfile({ ...profile, glassdoorUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">GitHub URL</label>
              <input
                type="text"
                value={profile.githubUrl}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Portfolio / Personal Website</label>
              <input
                type="text"
                value={profile.portfolioUrl}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Application Preferences & Logistics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Application Preferences & Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Years Experience</label>
              <input
                type="number"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Expected Salary / CTC</label>
              <input
                type="text"
                value={profile.expectedSalary}
                onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Authorization / Visa Status</label>
            <input
              type="text"
              value={profile.workAuthorization}
              onChange={(e) => setProfile({ ...profile, workAuthorization: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notice Period / Availability</label>
            <input
              type="text"
              value={profile.noticePeriod}
              onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Skills Chips */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Technical Skills & Keywords</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g. Next.js, Kubernetes)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Text Vault */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Full Resume Text (Source of Truth for AI)
          </h2>
          <span className="text-xs text-slate-400">Plaintext / Markdown</span>
        </div>
        <p className="text-xs text-slate-400">
          This text is automatically extracted when you upload your PDF above, or you can edit it manually. The AI references this when writing custom cover letters.
        </p>
        <textarea
          rows={10}
          value={profile.resumeText}
          onChange={(e) => setProfile({ ...profile, resumeText: e.target.value })}
          className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-4 leading-relaxed focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Pre-saved Custom Answers Dictionary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> Pre-Saved Recruiter Question Answers
        </h2>
        <p className="text-xs text-slate-400">
          Whenever a job portal asks a question matching these keywords, the AI will use your exact verified answer.
        </p>

        <div className="space-y-3">
          {Object.entries(profile.customAnswers || {}).map(([keyword, answer]) => (
            <div
              key={keyword}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Matching Keyword: "{keyword}"
                </span>
                <p className="text-xs text-slate-200">{answer}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCustomAnswer(keyword)}
                className="text-slate-500 hover:text-rose-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Answer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <input
            type="text"
            value={newQKey}
            onChange={(e) => setNewQKey(e.target.value)}
            placeholder="Keyword (e.g. relocation, security clearance)"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={newQAns}
            onChange={(e) => setNewQAns(e.target.value)}
            placeholder="Your verified answer"
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustomAnswer}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Custom Answer
        </button>
      </div>
    </form>
  );
}
