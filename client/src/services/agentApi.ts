import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/agent` : '/api/agent',
  headers: {
    'Content-Type': 'application/json'
  }
});

export type JobSource = 'LinkedIn' | 'Naukri' | 'Internshala' | 'Glassdoor' | 'Indeed' | 'Custom';

export type ApplicationStatus =
  | 'DISCOVERED'
  | 'MATCHED'
  | 'SHORTLISTED'
  | 'READY_TO_APPLY'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'OFFER'
  | 'WITHDRAWN';

export type EmailCategory =
  | 'APPLICATION_CONFIRMATION'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'RECRUITER'
  | 'REJECTION'
  | 'OFFER'
  | 'JOB_ALERT'
  | 'OTHER';

export type ActionClassification = 'ACTION_REQUIRED' | 'INFORMATIONAL' | 'NO_ACTION';

export interface StructuredResumeData {
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    branch: string;
    graduationYear: number;
    cgpa?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    techStack: string[];
    link?: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    date?: string;
  }>;
  preferred_roles: string[];
  locations: string[];
  achievements?: string[];
  keywords?: string[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  rawText: string;
  structuredData: StructuredResumeData;
  isDefault: boolean;
}

export interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  preferredLocations: string[];
  currentEducation?: string;
  graduationYear?: number;
  degree?: string;
  branch?: string;
  cgpa?: string;
  linkedinUrl: string;
  naukriUrl?: string;
  indeedUrl?: string;
  glassdoorUrl?: string;
  internshalaUrl?: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  aiMlSkills: string[];
  certifications: string[];
  experienceYears: number;
  preferredRoles: string[];
  preferredIndustries: string[];
  expectedSalary: string;
  minSalary?: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  experienceLevel: 'Entry / Fresher (0-2 Yrs)' | 'Mid-Level (3-5 Yrs)' | 'Senior (5+ Yrs)';
  workAuthorization: string;
  noticePeriod: string;
  customAnswers: Record<string, string>;
  resumeText: string;
  resumes: ResumeVersion[];
}

export interface JobMatchDetails {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'LOW_PRIORITY' | 'REJECT';
}

export interface JobItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  url: string;
  platform: JobSource | string;
  status: ApplicationStatus | string;
  applicationMode?: 'AUTO_APPLY' | 'ASSISTED_APPLY' | 'MANUAL';
  matchScore: number;
  matchDetails?: JobMatchDetails;
  dateDiscovered?: string;
  dateApplied?: string;
  appliedAt?: string;
  jobDescription?: string;
  coverLetter?: string;
  nextAction?: string;
  actionDeadline?: string;
  notes?: string;
  screenshotUrl?: string;
  emailReferences?: string[];
  questionsAnswered?: Array<{ question: string; answer: string }>;
}

export interface EmailAlertItem {
  id: string;
  messageId: string;
  sender: string;
  senderName?: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  category: EmailCategory | string;
  urgency: 'high' | 'medium' | 'low';
  actionClassification?: ActionClassification | string;
  matchedApplicationId?: string;
  isGenuine?: boolean;
  spamScore?: number;
  triageReason?: string;
  extractedInfo: {
    company?: string;
    jobTitle?: string;
    interviewDate?: string;
    interviewTime?: string;
    timezone?: string;
    meetingUrl?: string;
    interviewLink?: string;
    interviewType?: string;
    interviewer?: string;
    instructions?: string;
    assessmentDeadline?: string;
    deadline?: string;
    actionRequired?: string;
    summary?: string;
    keyPoints: string[];
    suggestedAction: string;
  };
  isRead: boolean;
  isNotified: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  source?: string;
  jobId?: string;
  result: 'SUCCESS' | 'FAILED' | 'RETRYING' | 'WAITING_FOR_USER' | 'RUNNING';
  error?: string;
  details?: any;
}

export type AgentLogItem = AuditLogItem;

export interface AnalyticsData {
  total: number;
  applied: number;
  assessments: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  interviewRate: number;
  bySource: Record<string, number>;
  statusCounts: Record<string, number>;
}

export interface AgentStatusData {
  status: string;
  uptime: number;
  mode: string;
  autonomousDaemon: any;
  totalJobs: number;
  appliedJobs: number;
  interviewingJobs: number;
  assessmentJobs: number;
  reviewingJobs: number;
  unreadAlerts: number;
  highPriorityAlerts: number;
  candidateName: string;
  jobAutomation: {
    isRunning: boolean;
    currentTask: string | null;
    totalJobs: number;
    appliedCount: number;
    reviewingCount: number;
    interviewingCount: number;
    assessmentCount?: number;
  };
}

export interface AgentSettingsData {
  geminiApiKey: string;
  openaiApiKey: string;
  aiProvider: 'gemini' | 'openai' | 'mock';
  emailConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    checkIntervalMinutes: number;
    enabled: boolean;
  };
  jobConfig: {
    keywords: string[];
    location: string;
    remoteOnly: boolean;
    autoApply: boolean;
    maxDailyApplications: number;
    maxApplicationsPerSource: number;
    minMatchScore: number;
    preferredSources: JobSource[];
    requireApprovalForExternal: boolean;
    coPilotMode: boolean;
    headlessBrowser: boolean;
  };
  agentToggles?: {
    autoDiscovery: boolean;
    autoMatching: boolean;
    autoApplication: boolean;
    emailMonitoring: boolean;
    aiCoverLetters: boolean;
    aiApplicationAnswers: boolean;
  };
  notifications: {
    desktopToast: boolean;
    soundEnabled: boolean;
    minUrgencyForToast: 'high' | 'medium' | 'low';
    webhookUrl?: string;
  };
  systemConfig?: {
    runOnStartup: boolean;
    offlineQueueEnabled: boolean;
  };
}

export const AgentApiService = {
  async getStatus(): Promise<AgentStatusData> {
    const res = await api.get('/status');
    return res.data.data;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await api.get('/analytics');
    return res.data.data;
  },

  async getProfile(): Promise<UserProfileData> {
    const res = await api.get('/profile');
    return res.data.data;
  },

  async updateProfile(profile: Partial<UserProfileData>): Promise<UserProfileData> {
    const res = await api.put('/profile', profile);
    return res.data.data;
  },

  async uploadResumePdf(file: File, resumeName?: string): Promise<any> {
    const formData = new FormData();
    formData.append('resume', file);
    if (resumeName) formData.append('resumeName', resumeName);

    const res = await api.post('/profile/resume-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  async getJobs(): Promise<JobItem[]> {
    const res = await api.get('/jobs');
    return res.data.data;
  },

  async searchJobs(options?: { keywords?: string[]; location?: string; platforms?: any[]; limit?: number }): Promise<JobItem[]> {
    const res = await api.post('/jobs/search', options || {});
    return res.data.data;
  },

  async prepareJob(jobId: string): Promise<JobItem> {
    const res = await api.post(`/jobs/${jobId}/prepare`);
    return res.data.data;
  },

  async processJob(jobId: string): Promise<JobItem> {
    return this.prepareJob(jobId);
  },

  async submitJob(jobId: string, mode: 'AUTO_APPLY' | 'ASSISTED_APPLY' | 'MANUAL' = 'ASSISTED_APPLY'): Promise<JobItem> {
    const res = await api.post(`/jobs/${jobId}/submit`, { mode });
    return res.data.data;
  },

  async applyJobLive(jobId: string): Promise<{ success: boolean; appliedOnPortal?: boolean; message: string }> {
    try {
      const res = await this.submitJob(jobId, 'AUTO_APPLY');
      return { success: true, appliedOnPortal: true, message: `Applied to ${res.company}` };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async openLoginWindow(portal: string = 'Naukri'): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Opened session for ${portal}` };
  },

  async updateJobStatus(jobId: string, status: ApplicationStatus, nextAction?: string, notes?: string): Promise<JobItem> {
    const res = await api.put(`/jobs/${jobId}/status`, { status, nextAction, notes });
    return res.data.data;
  },

  async updateJob(jobId: string, updates: Partial<JobItem>): Promise<JobItem> {
    const res = await api.put(`/jobs/${jobId}`, updates);
    return res.data.data;
  },

  async deleteJob(jobId: string): Promise<boolean> {
    const res = await api.delete(`/jobs/${jobId}`);
    return res.data.success;
  },

  async batchApply(count: number = 4): Promise<JobItem[]> {
    const res = await api.post('/jobs/batch-apply', { count });
    return res.data.data;
  },

  async queryAI(query: string): Promise<{ query: string; answer: string }> {
    const res = await api.post('/ai/query', { query });
    return res.data.data;
  },

  async getEmailAlerts(): Promise<EmailAlertItem[]> {
    const res = await api.get('/emails/alerts');
    return res.data.data;
  },

  async scanEmails(): Promise<{ scanned: number; newAlerts: number }> {
    const res = await api.post('/emails/scan');
    return res.data.data;
  },

  async simulateEmail(email: { sender: string; senderName?: string; subject: string; body: string }): Promise<EmailAlertItem> {
    const res = await api.post('/emails/simulate', email);
    return res.data.data;
  },

  async sendEmail(toOrData: any, subject?: string, body?: string): Promise<any> {
    return { success: true };
  },

  async markEmailRead(id: string): Promise<EmailAlertItem> {
    const res = await api.put(`/emails/alerts/${id}/read`);
    return res.data.data;
  },

  async testNotification(): Promise<any> {
    return { success: true, message: 'Notification triggered' };
  },

  async getSettings(): Promise<AgentSettingsData> {
    const res = await api.get('/settings');
    return res.data.data;
  },

  async updateSettings(settings: Partial<AgentSettingsData>): Promise<AgentSettingsData> {
    const res = await api.put('/settings', settings);
    return res.data.data;
  },

  async getLogs(): Promise<AuditLogItem[]> {
    const res = await api.get('/logs');
    return res.data.data;
  },

  async clearLogs(): Promise<void> {
    await api.delete('/logs');
  }
};
