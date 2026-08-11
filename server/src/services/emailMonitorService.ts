import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import cron, { ScheduledTask } from 'node-cron';
import { agentStore, EmailAlert } from '../config/store.js';
import { aiService } from './aiService.js';
import { notificationService } from './notificationService.js';
import { networkMonitorService } from './networkMonitorService.js';
import { emailToApplicationMatcher } from './emailToApplicationMatcher.js';

class EmailMonitorService {
  private cronJob: ScheduledTask | null = null;
  private isScanning = false;

  constructor() {
    this.initCron();

    networkMonitorService.on('online', async () => {
      console.log('🔄 [EmailMonitor] Connection detected. Triggering auto-scan for new emails...');
      await this.scanEmailsNow();
    });
  }

  public initCron() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    const settings = agentStore.getSettings();
    if (settings.emailConfig.enabled && settings.emailConfig.user && settings.emailConfig.pass) {
      const interval = Math.max(1, settings.emailConfig.checkIntervalMinutes || 5);
      const cronPattern = `*/${interval} * * * *`;

      this.cronJob = cron.schedule(cronPattern, async () => {
        if (!networkMonitorService.isOnline()) {
          console.log('ℹ️ [Cron] Offline mode: skipping email scan until network reconnects.');
          return;
        }
        console.log('⏰ [Cron] Running scheduled email monitor scan...');
        await this.scanEmailsNow();
      });

      agentStore.addAuditLog('EmailMonitor', `Email background watcher scheduled to run every ${interval} minutes.`, 'SUCCESS');
    }
  }

  public async scanEmailsNow(): Promise<{ scanned: number; newAlerts: number; errors?: string }> {
    if (!networkMonitorService.isOnline()) {
      agentStore.addAuditLog('EmailMonitor', 'Email scan skipped: Laptop is currently offline.', 'WAITING_FOR_USER');
      return { scanned: 0, newAlerts: 0, errors: 'Device offline' };
    }

    if (this.isScanning) {
      return { scanned: 0, newAlerts: 0, errors: 'Scan already in progress' };
    }

    const settings = agentStore.getSettings();
    const { emailConfig } = settings;

    if (!emailConfig.user || !emailConfig.pass) {
      agentStore.addAuditLog('EmailMonitor', 'Email scan skipped: IMAP credentials not configured yet.', 'WAITING_FOR_USER');
      return { scanned: 0, newAlerts: 0, errors: 'No IMAP credentials configured' };
    }

    this.isScanning = true;
    let scannedCount = 0;
    let newAlertCount = 0;

    const client = new ImapFlow({
      host: emailConfig.host || 'imap.gmail.com',
      port: emailConfig.port || 993,
      secure: emailConfig.secure !== false,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
      },
      logger: false
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const total = client.mailbox.exists || 0;
        const startSeq = Math.max(1, total - 30);
        const sequenceRange = `${startSeq}:*`;
        const messages = client.fetch(sequenceRange, { source: true, envelope: true });

        for await (const message of messages) {
          if (!message.source) continue;
          scannedCount++;
          const parsed: ParsedMail = await simpleParser(message.source);

          const messageId = parsed.messageId || `${message.uid || Date.now()}-${parsed.subject}`;
          const existing = agentStore.getEmailAlerts().some(a => a.messageId === messageId);
          if (existing) continue;

          const sender = parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown';
          const senderName = parsed.from?.value?.[0]?.name;
          const subject = parsed.subject || '(No Subject)';
          const body = parsed.text || (typeof parsed.html === 'string' ? parsed.html.replace(/<[^>]*>?/gm, '') : '');
          const snippet = body.slice(0, 160).replace(/\s+/g, ' ').trim();

          const classified = await aiService.classifyEmail(sender, subject, body);

          const alert = agentStore.addEmailAlert({
            messageId,
            sender,
            senderName,
            subject,
            date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
            snippet,
            body,
            category: classified.category,
            urgency: classified.urgency,
            actionClassification: classified.actionClassification,
            isGenuine: classified.isGenuine,
            spamScore: classified.spamScore,
            triageReason: classified.triageReason,
            extractedInfo: classified.extractedInfo,
            isRead: false,
            isNotified: false
          });

          // Match with existing job applications and transition status
          emailToApplicationMatcher.matchAndSync(alert);

          newAlertCount++;

          if (classified.isGenuine && (classified.urgency === 'high' || classified.category === 'INTERVIEW' || classified.category === 'OFFER' || classified.category === 'ASSESSMENT' || classified.category === 'RECRUITER')) {
            await notificationService.sendDesktopNotification({
              title: classified.category === 'INTERVIEW'
                ? '🟢 Interview Invitation'
                : classified.category === 'OFFER'
                ? '🎉 Job Offer Received!'
                : classified.category === 'ASSESSMENT'
                ? '⏱️ Assessment Test Required'
                : '💼 Recruiter Reachout',
              subtitle: senderName || sender,
              message: subject,
              urgency: classified.urgency,
              sound: true
            });
            alert.isNotified = true;
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
      agentStore.addAuditLog('EmailMonitor', `Email scan completed: checked ${scannedCount} unread emails, created ${newAlertCount} high-value alerts.`, 'SUCCESS');
    } catch (err: any) {
      console.error('❌ IMAP Scan error:', err);
      agentStore.addAuditLog('EmailMonitor', `IMAP connection/scan failed: ${err.message}`, 'FAILED', null, err.message);
      return { scanned: 0, newAlerts: 0, errors: err.message };
    } finally {
      this.isScanning = false;
    }

    return { scanned: scannedCount, newAlerts: newAlertCount };
  }

  public async simulateIncomingEmail(emailData: {
    sender: string;
    senderName?: string;
    subject: string;
    body: string;
  }): Promise<EmailAlert> {
    const messageId = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const snippet = emailData.body.slice(0, 160).replace(/\s+/g, ' ').trim();

    const classified = await aiService.classifyEmail(
      emailData.sender,
      emailData.subject,
      emailData.body
    );

    const alert = agentStore.addEmailAlert({
      messageId,
      sender: emailData.sender,
      senderName: emailData.senderName,
      subject: emailData.subject,
      date: new Date().toISOString(),
      snippet,
      body: emailData.body,
      category: classified.category,
      urgency: classified.urgency,
      actionClassification: classified.actionClassification,
      isGenuine: classified.isGenuine,
      spamScore: classified.spamScore,
      triageReason: classified.triageReason,
      extractedInfo: classified.extractedInfo,
      isRead: false,
      isNotified: false
    });

    // Match with applications and auto-update status
    emailToApplicationMatcher.matchAndSync(alert);

    if (classified.isGenuine && (classified.urgency === 'high' || classified.category === 'INTERVIEW' || classified.category === 'OFFER' || classified.category === 'ASSESSMENT')) {
      await notificationService.sendDesktopNotification({
        title: `[Simulated] ${classified.category.toUpperCase()}`,
        subtitle: emailData.senderName || emailData.sender,
        message: emailData.subject,
        urgency: classified.urgency,
        sound: true
      });
      alert.isNotified = true;
    }

    return alert;
  }
}

export const emailMonitorService = new EmailMonitorService();
