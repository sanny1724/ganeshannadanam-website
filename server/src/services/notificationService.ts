import notifier from 'node-notifier';
import { agentStore } from '../config/store.js';

export interface NotificationPayload {
  title: string;
  message: string;
  subtitle?: string;
  sound?: boolean;
  urgency?: 'high' | 'medium' | 'low';
  type?: 'interview' | 'job' | 'email' | 'system';
  openUrl?: string;
}

class NotificationService {
  /**
   * Send a native Windows desktop notification toast
   */
  async sendDesktopNotification(payload: NotificationPayload): Promise<boolean> {
    const settings = agentStore.getSettings();

    if (!settings.notifications.desktopToast) {
      console.log('ℹ️ Desktop notifications disabled in settings.');
      return false;
    }

    const urgencyRank = { high: 3, medium: 2, low: 1 };
    const minRank = urgencyRank[settings.notifications.minUrgencyForToast] || 2;
    const itemRank = urgencyRank[payload.urgency || 'medium'];

    if (itemRank < minRank) {
      console.log(`ℹ️ Notification urgency (${payload.urgency}) below user threshold (${settings.notifications.minUrgencyForToast}).`);
      return false;
    }

    const sound = settings.notifications.soundEnabled && (payload.sound !== false);
    const displayMessage = payload.subtitle ? `[${payload.subtitle}]\n${payload.message}` : payload.message;

    return new Promise((resolve) => {
      try {
        (notifier as any).notify(
          {
            title: payload.title,
            message: displayMessage,
            sound: sound,
            wait: false,
            appID: 'Desktop AI Agent',
            timeout: 8
          },
          (err: any) => {
            if (err) {
              console.warn('⚠️ Toast notification warning:', err.message);
              agentStore.addLog('error', `Failed to deliver desktop toast: ${err.message}`);
              resolve(false);
            } else {
              agentStore.addLog('notification', `Desktop notification delivered: "${payload.title}"`);
              resolve(true);
            }
          }
        );
      } catch (err: any) {
        console.error('❌ Notification service error:', err);
        agentStore.addLog('error', `Notification exception: ${err.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Test desktop notification
   */
  async testNotification(): Promise<{ success: boolean; message: string }> {
    await this.sendDesktopNotification({
      title: '🎯 AI Agent Active',
      subtitle: 'Desktop Notification Test',
      message: 'Your AI Agent is successfully monitoring jobs and incoming high-priority emails!',
      urgency: 'high',
      sound: true
    });

    return {
      success: true,
      message: 'Windows Toast notification sent to desktop'
    };
  }
}

export const notificationService = new NotificationService();
