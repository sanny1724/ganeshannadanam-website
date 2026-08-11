import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import path from 'path';
import fs from 'fs';
import { agentStore, ApplicationStatus, JobSource } from '../config/store.js';
import { aiService } from '../services/aiService.js';
import { emailMonitorService } from '../services/emailMonitorService.js';
import { jobAutomationService } from '../services/jobAutomationService.js';
import { naukriBrowserService } from '../services/naukriBrowserService.js';
import { autonomousDaemonService } from '../services/autonomousDaemonService.js';

const router = Router();

const uploadDir = path.resolve(process.cwd(), 'data', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `resume-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============================================================================
// 1. STATUS & ANALYTICS
// ============================================================================

router.get('/status', (req: Request, res: Response) => {
  const profile = agentStore.getProfile();
  const settings = agentStore.getSettings();
  const jobs = agentStore.getJobs();
  const emailAlerts = agentStore.getEmailAlerts();
  const jobStatus = jobAutomationService.getStatus();
  const daemonStatus = autonomousDaemonService.getStatus();

  res.json({
    success: true,
    data: {
      status: 'active',
      uptime: process.uptime(),
      mode: '24/7 Autonomous Background Daemon',
      autonomousDaemon: daemonStatus,
      totalJobs: jobs.length,
      appliedJobs: jobs.filter(j => j.status === 'APPLIED' || j.status === 'applied').length,
      interviewingJobs: jobs.filter(j => j.status === 'INTERVIEW' || j.status === 'interviewing').length,
      assessmentJobs: jobs.filter(j => j.status === 'ASSESSMENT').length,
      reviewingJobs: jobs.filter(j => j.status === 'READY_TO_APPLY' || j.status === 'reviewing').length,
      unreadAlerts: emailAlerts.filter(e => !e.isRead).length,
      highPriorityAlerts: emailAlerts.filter(e => e.urgency === 'high').length,
      jobAutomation: jobStatus,
      candidateName: profile.fullName
    }
  });
});

router.get('/analytics', (req: Request, res: Response) => {
  const jobs = agentStore.getJobs();
  const emails = agentStore.getEmailAlerts();

  const total = jobs.length;
  const applied = jobs.filter(j => j.status === 'APPLIED' || j.status === 'applied').length;
  const assessments = jobs.filter(j => j.status === 'ASSESSMENT').length;
  const interviews = jobs.filter(j => j.status === 'INTERVIEW' || j.status === 'interviewing').length;
  const offers = jobs.filter(j => j.status === 'OFFER').length;
  const rejected = jobs.filter(j => j.status === 'REJECTED').length;

  const bySource: Record<string, number> = {};
  jobs.forEach(j => {
    bySource[j.platform] = (bySource[j.platform] || 0) + 1;
  });

  const responseRate = applied > 0 ? Math.round(((assessments + interviews + offers + rejected) / applied) * 100) : 0;
  const interviewRate = applied > 0 ? Math.round(((interviews + offers) / applied) * 100) : 0;

  res.json({
    success: true,
    data: {
      total,
      applied,
      assessments,
      interviews,
      offers,
      rejected,
      responseRate,
      interviewRate,
      bySource,
      statusCounts: {
        DISCOVERED: jobs.filter(j => j.status === 'DISCOVERED').length,
        MATCHED: jobs.filter(j => j.status === 'MATCHED').length,
        READY_TO_APPLY: jobs.filter(j => j.status === 'READY_TO_APPLY' || j.status === 'reviewing').length,
        APPLIED: applied,
        ASSESSMENT: assessments,
        INTERVIEW: interviews,
        OFFER: offers,
        REJECTED: rejected
      }
    }
  });
});

// ============================================================================
// 2. USER PROFILE & MULTI-RESUME PARSER
// ============================================================================

router.get('/profile', (req: Request, res: Response) => {
  res.json({ success: true, data: agentStore.getProfile() });
});

router.put('/profile', (req: Request, res: Response) => {
  const updated = agentStore.updateProfile(req.body);
  res.json({ success: true, data: updated });
});

router.post('/profile/resume-upload', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text.replace(/\r\n/g, '\n').trim();

    // AI Structured Resume Parsing
    const structured = await aiService.parseResume(extractedText);

    // Save as versioned resume in profile
    const newVersion = agentStore.addResumeVersion({
      name: req.body.resumeName || req.file.originalname,
      fileName: req.file.originalname,
      rawText: extractedText,
      structuredData: structured,
      isDefault: true
    });

    // Merge skills and educational parameters into user profile
    const currentProfile = agentStore.getProfile();
    const updatedSkills = Array.from(new Set([...currentProfile.skills, ...structured.skills]));

    const updatedProfile = agentStore.updateProfile({
      resumeText: extractedText,
      skills: updatedSkills,
      currentEducation: structured.education[0]?.degree ? `${structured.education[0].degree} in ${structured.education[0].branch}` : currentProfile.currentEducation,
      graduationYear: structured.education[0]?.graduationYear || currentProfile.graduationYear,
      degree: structured.education[0]?.degree || currentProfile.degree,
      branch: structured.education[0]?.branch || currentProfile.branch,
      cgpa: structured.education[0]?.cgpa || currentProfile.cgpa
    });

    agentStore.addAuditLog('ResumeAgent', `Parsed PDF Resume "${req.file.originalname}": Extracted ${structured.skills.length} skills & structured JSON.`, 'SUCCESS');

    res.json({
      success: true,
      data: {
        resumeVersion: newVersion,
        structuredProfile: structured,
        profile: updatedProfile
      }
    });
  } catch (err: any) {
    console.error('PDF Parse error:', err);
    agentStore.addAuditLog('ResumeAgent', `PDF parse failed: ${err.message}`, 'FAILED', null, err.message);
    res.status(500).json({ success: false, error: `Failed parsing PDF resume: ${err.message}` });
  }
});

// ============================================================================
// 3. JOB DISCOVERY & APPLICATION MANAGEMENT (KANBAN)
// ============================================================================

router.get('/jobs', (req: Request, res: Response) => {
  res.json({ success: true, data: agentStore.getJobs() });
});

router.post('/jobs/search', async (req: Request, res: Response) => {
  try {
    const { keywords, location, platforms, limit } = req.body;
    const results = await jobAutomationService.searchJobs({
      keywords,
      location,
      platforms,
      limit: limit || 5
    });
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/jobs/:id/prepare', async (req: Request, res: Response) => {
  try {
    const prepared = await jobAutomationService.prepareApplication(req.params.id);
    res.json({ success: true, data: prepared });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/jobs/:id/submit', async (req: Request, res: Response) => {
  try {
    const { mode } = req.body;
    const submitted = await jobAutomationService.submitApplication(req.params.id, mode || 'ASSISTED_APPLY');
    res.json({ success: true, data: submitted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/jobs/:id/status', (req: Request, res: Response) => {
  const { status, nextAction, notes } = req.body;
  const updated = agentStore.updateJob(req.params.id, {
    status: status as ApplicationStatus,
    nextAction,
    notes
  });
  if (!updated) return res.status(404).json({ success: false, error: 'Job not found' });
  agentStore.addAuditLog('KanbanTracker', `Updated status of ${updated.company} to ${status}`, 'SUCCESS', null, undefined, updated.platform, updated.id);
  res.json({ success: true, data: updated });
});

router.put('/jobs/:id', (req: Request, res: Response) => {
  const updated = agentStore.updateJob(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, data: updated });
});

router.delete('/jobs/:id', (req: Request, res: Response) => {
  const success = agentStore.deleteJob(req.params.id);
  res.json({ success });
});

router.post('/jobs/batch-apply', async (req: Request, res: Response) => {
  try {
    const count = req.body.count || 4;
    const results = await jobAutomationService.runAutoApplyBatch(count);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. NATURAL LANGUAGE AI EMAIL & APPLICATION ASSISTANT
// ============================================================================

router.post('/ai/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query is required.' });

    const answer = await aiService.answerUserQuery(query, agentStore.data);
    res.json({ success: true, data: { query, answer } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. EMAIL RADAR & TRIAGE
// ============================================================================

router.get('/emails/alerts', (req: Request, res: Response) => {
  res.json({ success: true, data: agentStore.getEmailAlerts() });
});

router.post('/emails/scan', async (req: Request, res: Response) => {
  try {
    const result = await emailMonitorService.scanEmailsNow();
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/emails/simulate', async (req: Request, res: Response) => {
  try {
    const alert = await emailMonitorService.simulateIncomingEmail(req.body);
    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/emails/alerts/:id/read', (req: Request, res: Response) => {
  const updated = agentStore.updateEmailAlert(req.params.id, { isRead: true });
  res.json({ success: true, data: updated });
});

// ============================================================================
// 6. SETTINGS & OBSERVABILITY AUDIT LOGS
// ============================================================================

router.get('/settings', (req: Request, res: Response) => {
  res.json({ success: true, data: agentStore.getSettings() });
});

router.put('/settings', (req: Request, res: Response) => {
  const updated = agentStore.updateSettings(req.body);
  emailMonitorService.initCron();
  res.json({ success: true, data: updated });
});

router.get('/logs', (req: Request, res: Response) => {
  res.json({ success: true, data: agentStore.getLogs() });
});

router.delete('/logs', (req: Request, res: Response) => {
  agentStore.clearLogs();
  res.json({ success: true });
});

export default router;
