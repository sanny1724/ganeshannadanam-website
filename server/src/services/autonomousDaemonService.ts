import cron from 'node-cron';
import { agentStore } from '../config/store.js';
import { emailMonitorService } from './emailMonitorService.js';
import { jobAutomationService } from './jobAutomationService.js';
import { naukriBrowserService } from './naukriBrowserService.js';
import { notificationService } from './notificationService.js';

class AutonomousDaemonService {
  private isRunning = false;
  private emailCronTask: cron.ScheduledTask | null = null;
  private jobCronTask: cron.ScheduledTask | null = null;
  private lastJobScanTime: Date | null = null;
  private lastEmailScanTime: Date | null = null;
  private nextJobScanTime: Date | null = null;

  constructor() {
    // Auto-start daemon on instantiation
    this.startDaemon();
  }

  /**
   * Start the continuous autonomous background worker
   */
  startDaemon() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🤖 [Autonomous Daemon] Starting 24/7 background agent loop...');
    agentStore.addLog('system', 'Autonomous Background Daemon started: Continuously applying to jobs & monitoring emails silently while you work.');

    // 1. Email Radar Loop: Every 5 minutes
    this.emailCronTask = cron.schedule('*/5 * * * *', async () => {
      try {
        this.lastEmailScanTime = new Date();
        console.log('⏰ [Daemon Email Loop] Silently scanning for recruiter & assessment emails...');
        const alerts = await emailMonitorService.scanEmails(30);
        const highPriority = alerts.filter(a => a.urgency === 'high' && a.isGenuine && !a.isRead);
        if (highPriority.length > 0) {
          agentStore.addLog('email', `[Daemon] Found ${highPriority.length} high priority recruiter email(s)!`);
        }
      } catch (err: any) {
        console.error('[Daemon Email Error]:', err.message);
      }
    });

    // 2. Autonomous Job Hunter Loop: Every 15 minutes
    // Automatically scouts, writes tailored cover letters, and applies in the background
    this.jobCronTask = cron.schedule('*/15 * * * *', async () => {
      await this.runAutonomousJobCycle();
    });

    // Initial immediate background run after 10 seconds of boot
    setTimeout(() => {
      this.runAutonomousJobCycle().catch(console.error);
    }, 10000);

    this.nextJobScanTime = new Date(Date.now() + 15 * 60 * 1000);
  }

  /**
   * Single autonomous cycle: scout + tailor + apply silently
   */
  async runAutonomousJobCycle() {
    try {
      this.lastJobScanTime = new Date();
      this.nextJobScanTime = new Date(Date.now() + 15 * 60 * 1000);
      const settings = agentStore.getSettings();
      const profile = agentStore.getProfile();

      console.log('🚀 [Daemon Job Loop] Autonomous scan starting across Naukri, LinkedIn, Indeed, Glassdoor...');
      agentStore.addLog('job', '[Autonomous Daemon] Scanning for new software engineer roles silently in background...');

      // 1. Scout 3 new matching roles
      const newJobs = await jobAutomationService.searchJobs({
        keywords: profile.targetRoles.length ? profile.targetRoles : ['Software Development Engineer', 'Full Stack Developer', 'Node.js Developer'],
        location: 'Hyderabad / Bengaluru / Remote',
        platforms: ['Naukri', 'LinkedIn', 'Indeed', 'Glassdoor'],
        limit: 3
      });

      // 2. Auto-apply to each job silently in background
      for (const job of newJobs) {
        try {
          // Process cover letter & answers
          const processed = await jobAutomationService.processJobApplication(job.id);
          if (processed) {
            agentStore.updateJob(job.id, {
              status: 'applied',
              appliedAt: new Date().toISOString(),
              notes: `Autonomous Background Agent applied on ${job.platform}. Tailored cover letter & resume submitted.`
            });

            console.log(`✅ [Daemon Auto-Applied] ${job.company} - ${job.jobTitle} on ${job.platform}`);
          }
        } catch (err: any) {
          console.error(`[Daemon Apply Error for ${job.company}]:`, err.message);
        }
      }

      // 3. Send quiet desktop notification confirming background work done
      if (newJobs.length > 0) {
        await notificationService.sendDesktopNotification({
          title: `🤖 Autonomous Agent Applied (${newJobs.length} Jobs)`,
          subtitle: 'Background Work While You Were Working',
          message: `Applied to ${newJobs.map(j => j.company).join(', ')} across Naukri/LinkedIn/Indeed/Glassdoor!`,
          urgency: 'medium',
          sound: false // Quiet notification so it doesn't disturb user's active work
        });
      }
    } catch (err: any) {
      console.error('[Daemon Job Loop Error]:', err.message);
      agentStore.addLog('error', `Autonomous Daemon error: ${err.message}`);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastJobScanTime: this.lastJobScanTime,
      lastEmailScanTime: this.lastEmailScanTime,
      nextJobScanTime: this.nextJobScanTime,
      totalAutoApplied: agentStore.getJobs().filter(j => j.status === 'applied').length
    };
  }

  stopDaemon() {
    this.isRunning = false;
    this.emailCronTask?.stop();
    this.jobCronTask?.stop();
    agentStore.addLog('system', 'Autonomous Background Daemon paused.');
  }
}

export const autonomousDaemonService = new AutonomousDaemonService();
