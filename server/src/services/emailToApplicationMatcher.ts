import { agentStore, EmailAlert, JobApplication, ApplicationStatus } from '../config/store.js';
import { notificationService } from './notificationService.js';

class EmailToApplicationMatcher {
  /**
   * Match an incoming email to an active job application and transition status
   */
  public matchAndSync(email: EmailAlert): { matched: boolean; application?: JobApplication; previousStatus?: string } {
    const jobs = agentStore.getJobs();
    const sender = (email.sender || '').toLowerCase();
    const subject = (email.subject || '').toLowerCase();
    const body = (email.body || '').toLowerCase();
    const extractedCompany = (email.extractedInfo.company || '').toLowerCase();

    // 1. Find matching application by company or domain
    let matchedJob: JobApplication | undefined = jobs.find(job => {
      const companyLower = job.company.toLowerCase();
      const cleanCompany = companyLower.replace(/[^a-z0-9]/g, '');

      // Direct company name match in sender or subject
      if (cleanCompany.length > 2 && (sender.includes(cleanCompany) || subject.includes(companyLower) || extractedCompany.includes(companyLower))) {
        return true;
      }
      return false;
    });

    if (!matchedJob) {
      return { matched: false };
    }

    const previousStatus = matchedJob.status;
    let newStatus: ApplicationStatus | null = null;
    let nextAction = matchedJob.nextAction;

    // 2. State transition based on email category
    if (email.category === 'ASSESSMENT') {
      newStatus = 'ASSESSMENT';
      nextAction = email.extractedInfo.suggestedAction || 'Complete coding assessment test';
    } else if (email.category === 'INTERVIEW') {
      newStatus = 'INTERVIEW';
      nextAction = email.extractedInfo.meetingUrl
        ? `Interview scheduled (${email.extractedInfo.meetingUrl})`
        : 'Confirm interview availability with recruiter';
    } else if (email.category === 'OFFER') {
      newStatus = 'OFFER';
      nextAction = 'Review formal employment offer terms';
    } else if (email.category === 'REJECTION') {
      newStatus = 'REJECTED';
      nextAction = 'Archived (Company pursuing other candidates)';
    } else if (email.category === 'APPLICATION_CONFIRMATION' && matchedJob.status !== 'APPLIED') {
      newStatus = 'APPLIED';
      nextAction = 'Application confirmed by company ATS';
    }

    // 3. Update application and email references
    const updatedJob = agentStore.updateJob(matchedJob.id, {
      status: newStatus || matchedJob.status,
      nextAction,
      actionDeadline: email.extractedInfo.assessmentDeadline || email.extractedInfo.interviewDate,
      emailReferences: [...(matchedJob.emailReferences || []), email.id]
    });

    // Update email with matched application ID
    agentStore.updateEmailAlert(email.id, {
      matchedApplicationId: matchedJob.id
    });

    if (newStatus && newStatus !== previousStatus) {
      agentStore.addAuditLog(
        'EmailApplicationMatcher',
        `Auto-transitioned ${matchedJob.company} (${matchedJob.jobTitle}) status from ${previousStatus} -> ${newStatus} based on email: "${email.subject}"`,
        'SUCCESS',
        { emailId: email.id, newStatus },
        undefined,
        matchedJob.platform,
        matchedJob.id
      );

      // Desktop alert for critical status upgrades
      if (newStatus === 'INTERVIEW' || newStatus === 'ASSESSMENT' || newStatus === 'OFFER') {
        notificationService.sendDesktopNotification({
          title: `🎯 ${matchedJob.company}: ${newStatus}!`,
          subtitle: 'Application Status Automatically Upgraded',
          message: `${email.subject} - ${nextAction}`,
          urgency: 'high',
          sound: true
        });
      }
    }

    return {
      matched: true,
      application: updatedJob || matchedJob,
      previousStatus
    };
  }
}

export const emailToApplicationMatcher = new EmailToApplicationMatcher();
