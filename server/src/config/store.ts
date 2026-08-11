import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// ============================================================================
// 1. STRUCTURED PROFILE & MULTI-RESUME ENTITIES
// ============================================================================

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
  technologies?: string[];
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

export interface UserProfile {
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

// ============================================================================
// 2. NORMALIZED JOB & EXPLAINABLE MATCHING ENTITIES
// ============================================================================

export type JobSource = 'LinkedIn' | 'Naukri' | 'Internshala' | 'Glassdoor' | 'Indeed' | 'Custom';

export interface JobMatchDetails {
  match_score: number; // 0 - 100
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'LOW_PRIORITY' | 'REJECT';
}

export interface NormalizedJob {
  id: string; // SHA-256 fingerprint hash
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  description: string;
  skills: string[];
  source: JobSource;
  source_url: string;
  job_id: string;
  posted_date: string;
  application_method: 'AUTO_APPLY' | 'ASSISTED_APPLY' | 'MANUAL';
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  matchScore: number;
  matchDetails?: JobMatchDetails;
}

// ============================================================================
// 3. 10-STATE APPLICATION TRACKER ENTITY
// ============================================================================

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

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  url: string;
  platform: JobSource;
  status: ApplicationStatus;
  applicationMode: 'AUTO_APPLY' | 'ASSISTED_APPLY' | 'MANUAL';
  matchScore: number;
  matchDetails?: JobMatchDetails;
  resumeIdUsed?: string;
  dateDiscovered: string;
  dateApplied?: string;
  jobDescription?: string;
  coverLetter?: string;
  nextAction?: string;
  actionDeadline?: string;
  notes?: string;
  screenshotUrl?: string;
  emailReferences?: string[];
  questionsAnswered?: Array<{ question: string; answer: string }>;
}

// ============================================================================
// 4. EMAIL CLASSIFICATION & INTERVIEW DETECTION ENTITIES
// ============================================================================

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

export interface EmailAlert {
  id: string;
  messageId: string;
  sender: string;
  senderName?: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  category: EmailCategory;
  urgency: 'high' | 'medium' | 'low';
  actionClassification: ActionClassification;
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
    interviewType?: string;
    interviewer?: string;
    instructions?: string;
    assessmentDeadline?: string;
    actionRequired?: string;
    summary?: string;
    keyPoints: string[];
    suggestedAction: string;
  };
  isRead: boolean;
  isNotified: boolean;
}

// ============================================================================
// 5. AUDIT LOG & AGENT TASK ENTITIES
// ============================================================================

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

export interface AgentSettings {
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
  agentToggles: {
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
  systemConfig: {
    runOnStartup: boolean;
    offlineQueueEnabled: boolean;
  };
}

export interface AgentData {
  profile: UserProfile;
  jobs: JobApplication[];
  emailAlerts: EmailAlert[];
  settings: AgentSettings;
  logs: AuditLogItem[];
}

// ============================================================================
// 6. DEFAULT STORE & PERSISTENCE ENGINE
// ============================================================================

export function generateJobFingerprint(company: string, title: string, location: string, sourceJobId?: string): string {
  const raw = `${company.toLowerCase().trim()}|${title.toLowerCase().trim()}|${location.toLowerCase().trim()}|${sourceJobId || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

const defaultProfile: UserProfile = {
  fullName: 'B Sannith Reddy',
  email: 'sravssunny15@gmail.com',
  phone: '+91 98765 43210',
  location: 'Hyderabad, Telangana, India (Open to Remote)',
  preferredLocations: ['Hyderabad', 'Bengaluru', 'Remote', 'Pune'],
  currentEducation: 'B.Tech / B.E. in Artificial Intelligence',
  graduationYear: 2026,
  degree: 'B.Tech',
  branch: 'Artificial Intelligence & Machine Learning',
  cgpa: '8.4',
  linkedinUrl: 'https://www.linkedin.com/in/sannithreddy17/',
  naukriUrl: 'https://www.naukri.com/mnjuser/profile',
  indeedUrl: 'https://profile.indeed.com/',
  glassdoorUrl: 'https://www.glassdoor.co.in/',
  internshalaUrl: 'https://internshala.com/student/dashboard',
  githubUrl: 'https://github.com/sannithreddy',
  portfolioUrl: 'https://sannithreddy.dev',
  summary: 'Artificial Intelligence & Full-Stack Engineer with strong practical experience building high-performance web systems, LLM-powered workflows, TypeScript/React frontends, Node.js/Python backends, and Playwright automation.',
  skills: [
    'TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'Next.js', 'FastAPI',
    'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Playwright', 'LangChain',
    'REST APIs', 'GraphQL', 'TailwindCSS', 'Git', 'Linux'
  ],
  programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'C++'],
  frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'TailwindCSS'],
  aiMlSkills: ['Agentic Workflows', 'LLMs', 'Prompt Engineering', 'LangChain', 'RAG Pipelines', 'OpenAI API'],
  certifications: ['AWS Certified Cloud Practitioner', 'Full Stack Web Development', 'AI/ML Engineering Specialist'],
  experienceYears: 1,
  preferredRoles: ['Software Development Engineer', 'Full Stack Developer', 'Backend Engineer', 'AI/ML Engineer'],
  preferredIndustries: ['Technology / SaaS', 'FinTech', 'AI Platforms', 'E-Commerce'],
  expectedSalary: '₹14-22 LPA (Negotiable)',
  minSalary: '₹10 LPA',
  workMode: 'Remote',
  experienceLevel: 'Entry / Fresher (0-2 Yrs)',
  workAuthorization: 'Authorized to work in India & Remote Global',
  noticePeriod: 'Immediate / 15 Days',
  customAnswers: {
    'relocation': 'Yes, I am fully open to relocating to Hyderabad, Bengaluru, or working in a remote setup.',
    'notice': 'Immediate / 15 days notice period.',
    'salary': '₹14,00,000 - ₹22,00,000 / year (negotiable depending on benefits).',
    'experience': 'Hands-on experience in full-stack and AI application development with TypeScript, React, Node.js, Python, and PostgreSQL.'
  },
  resumeText: `B Sannith Reddy
Email: sravssunny15@gmail.com | Phone: +91 98765 43210 | Location: Hyderabad, India
LinkedIn: https://www.linkedin.com/in/sannithreddy17/ | GitHub: https://github.com/sannithreddy

EDUCATION:
- B.Tech in Artificial Intelligence & Data Science | St. Peter's Engineering College (2022 - 2026) | CGPA: 8.4

TECHNICAL SKILLS:
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frontend: React.js, Next.js, TailwindCSS, Redux Toolkit, Vite
- Backend: Node.js, Express.js, FastAPI, RESTful APIs, WebSockets, PostgreSQL, MongoDB, Redis
- AI & Automation: Agentic Workflows, LangChain, OpenAI APIs, Playwright browser automation
- DevOps & Tools: Docker, AWS (S3, EC2), Git/GitHub, Linux

PROJECTS:
1. Autonomous AI Job Hunter & Email Radar: Built full-stack autonomous system tracking multi-platform jobs with Playwright automation, Gmail IMAP triage, and customized LLM cover letters.
2. High-Throughput E-Commerce Platform: Architected microservices with Node.js and PostgreSQL processing 1,000+ RPS with Redis caching.`,
  resumes: [
    {
      id: 'res-default-01',
      name: 'Software Engineer & AI Specialization (Primary)',
      fileName: 'B_Sannith_Reddy_Resume.pdf',
      uploadedAt: new Date().toISOString(),
      rawText: 'B Sannith Reddy - Software Development Engineer & AI Specialist...',
      isDefault: true,
      structuredData: {
        skills: ['TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Playwright'],
        education: [{ institution: "St. Peter's Engineering College", degree: 'B.Tech', branch: 'AI & Data Science', graduationYear: 2026, cgpa: '8.4' }],
        experience: [{ company: 'Independent Engineering Projects', role: 'Full Stack & Automation Developer', duration: '2023 - Present', highlights: ['Architected scalable web apps', 'Built automated Playwright crawlers'] }],
        projects: [{ name: 'Autonomous Desktop Assistant', description: 'Multi-platform job & email intelligence bot', techStack: ['React', 'TypeScript', 'Node.js', 'Playwright'] }],
        certifications: [{ title: 'Full Stack Development', issuer: 'Meta / Coursera' }],
        preferred_roles: ['Software Development Engineer', 'Full Stack Developer', 'Backend Engineer'],
        locations: ['Hyderabad', 'Bengaluru', 'Remote']
      }
    }
  ]
};

const defaultSettings: AgentSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: 'gemini',
  emailConfig: {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    user: 'sravssunny15@gmail.com',
    pass: 'dzroluotukbatizo',
    checkIntervalMinutes: 5,
    enabled: true
  },
  jobConfig: {
    keywords: ['Software Development Engineer', 'Full Stack Developer', 'Node.js', 'React', 'Python', 'AI Engineer'],
    location: 'Hyderabad / Bengaluru / Remote',
    remoteOnly: false,
    autoApply: true,
    maxDailyApplications: 50,
    maxApplicationsPerSource: 15,
    minMatchScore: 75,
    preferredSources: ['Naukri', 'LinkedIn', 'Internshala', 'Indeed', 'Glassdoor'],
    requireApprovalForExternal: false,
    coPilotMode: false,
    headlessBrowser: false
  },
  agentToggles: {
    autoDiscovery: true,
    autoMatching: true,
    autoApplication: true,
    emailMonitoring: true,
    aiCoverLetters: true,
    aiApplicationAnswers: true
  },
  notifications: {
    desktopToast: true,
    soundEnabled: true,
    minUrgencyForToast: 'medium'
  },
  systemConfig: {
    runOnStartup: true,
    offlineQueueEnabled: true
  }
};

class AgentStore {
  private dataFilePath: string;
  public data: AgentData;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dataFilePath = path.join(dataDir, 'agent-store.json');
    this.data = this.loadData();
  }

  private loadData(): AgentData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profile: { ...defaultProfile, ...(parsed.profile || {}) },
          jobs: parsed.jobs || [],
          emailAlerts: parsed.emailAlerts || [],
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
          logs: parsed.logs || []
        };
      }
    } catch (err) {
      console.error('Failed reading agent store from disk, initializing default:', err);
    }

    const initial: AgentData = {
      profile: defaultProfile,
      jobs: [],
      emailAlerts: [],
      settings: defaultSettings,
      logs: []
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: AgentData): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing agent store to disk:', err);
    }
  }

  public getProfile(): UserProfile {
    return this.data.profile;
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.profile = { ...this.data.profile, ...updates };
    this.saveData(this.data);
    return this.data.profile;
  }

  public addResumeVersion(resume: Omit<ResumeVersion, 'id' | 'uploadedAt'>): ResumeVersion {
    const newVersion: ResumeVersion = {
      ...resume,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uploadedAt: new Date().toISOString()
    };
    if (resume.isDefault) {
      this.data.profile.resumes.forEach(r => (r.isDefault = false));
    }
    this.data.profile.resumes.unshift(newVersion);
    this.saveData(this.data);
    return newVersion;
  }

  public getJobs(): JobApplication[] {
    return this.data.jobs;
  }

  public addJob(job: Omit<JobApplication, 'id' | 'dateDiscovered'> & { id?: string }): JobApplication {
    const id = job.id || generateJobFingerprint(job.company, job.jobTitle, job.location, job.url);
    const existingIndex = this.data.jobs.findIndex(j => j.id === id);

    const newJob: JobApplication = {
      ...job,
      id,
      dateDiscovered: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.data.jobs[existingIndex] = { ...this.data.jobs[existingIndex], ...newJob };
      this.saveData(this.data);
      return this.data.jobs[existingIndex];
    } else {
      this.data.jobs.unshift(newJob);
      this.saveData(this.data);
      return newJob;
    }
  }

  public updateJob(id: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx === -1) return null;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
    this.saveData(this.data);
    return this.data.jobs[idx];
  }

  public deleteJob(id: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => j.id !== id);
    if (this.data.jobs.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  public getEmailAlerts(): EmailAlert[] {
    return this.data.emailAlerts;
  }

  public addEmailAlert(alert: Omit<EmailAlert, 'id'>): EmailAlert {
    const existing = this.data.emailAlerts.find(e => e.messageId === alert.messageId);
    if (existing) return existing;

    const newAlert: EmailAlert = {
      ...alert,
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    this.data.emailAlerts.unshift(newAlert);
    this.saveData(this.data);
    return newAlert;
  }

  public updateEmailAlert(id: string, updates: Partial<EmailAlert>): EmailAlert | null {
    const idx = this.data.emailAlerts.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.emailAlerts[idx] = { ...this.data.emailAlerts[idx], ...updates };
    this.saveData(this.data);
    return this.data.emailAlerts[idx];
  }

  public getSettings(): AgentSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AgentSettings>): AgentSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      jobConfig: { ...this.data.settings.jobConfig, ...(updates.jobConfig || {}) },
      emailConfig: { ...this.data.settings.emailConfig, ...(updates.emailConfig || {}) },
      agentToggles: { ...this.data.settings.agentToggles, ...(updates.agentToggles || {}) },
      notifications: { ...this.data.settings.notifications, ...(updates.notifications || {}) },
      systemConfig: { ...this.data.settings.systemConfig, ...(updates.systemConfig || {}) }
    };
    this.saveData(this.data);
    return this.data.settings;
  }

  public addAuditLog(
    agent: string,
    action: string,
    result: AuditLogItem['result'],
    details?: any,
    error?: string,
    source?: string,
    jobId?: string
  ): AuditLogItem {
    const logItem: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      agent,
      action,
      source,
      jobId,
      result,
      error,
      details
    };
    this.data.logs.unshift(logItem);
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.saveData(this.data);
    return logItem;
  }

  public addLog(type: string, message: string, details?: any): void {
    this.addAuditLog(type, message, 'SUCCESS', details);
  }

  public getLogs(): AuditLogItem[] {
    return this.data.logs;
  }

  public clearLogs(): void {
    this.data.logs = [];
    this.saveData(this.data);
  }
}

export const agentStore = new AgentStore();
