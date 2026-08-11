import dns from 'dns';
import { EventEmitter } from 'events';
import { agentStore } from '../config/store.js';
import { notificationService } from './notificationService.js';

class NetworkMonitorService extends EventEmitter {
  private online: boolean = true;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastChecked: string = new Date().toISOString();

  constructor() {
    super();
    this.startMonitoring();
  }

  /**
   * Check if laptop currently has internet access
   */
  async checkInternetConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      // Lookup standard reliable hosts (Google DNS, Cloudflare) with a short 2.5s timeout
      dns.lookup('google.com', (err) => {
        if (!err) {
          resolve(true);
        } else {
          dns.lookup('cloudflare.com', (err2) => {
            resolve(!err2);
          });
        }
      });
    });
  }

  /**
   * Start polling network state every 8 seconds
   */
  startMonitoring(intervalMs: number = 8000) {
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Initial check
    this.checkInternetConnection().then((isOnline) => {
      this.online = isOnline;
      this.lastChecked = new Date().toISOString();
      agentStore.addLog(
        'system',
        isOnline
          ? 'Network connected: Agent operating in full live online mode.'
          : 'Offline mode active: Agent running locally on laptop, network tasks paused.'
      );
    });

    this.checkInterval = setInterval(async () => {
      const isOnline = await this.checkInternetConnection();
      this.lastChecked = new Date().toISOString();

      if (isOnline !== this.online) {
        const wasOffline = !this.online;
        this.online = isOnline;

        if (isOnline && wasOffline) {
          // TRANSITION: Offline -> Online
          console.log('🟢 [Network] Internet connection restored! Resuming background tasks...');
          agentStore.addLog('system', '🟢 Network connection restored! AI Agent resuming automated job & email scans.');

          this.emit('online');

          // Trigger Windows Toast on reconnection
          await notificationService.sendDesktopNotification({
            title: '🟢 Network Restored',
            subtitle: 'AI Desktop Assistant',
            message: 'Connection active. Background email monitor and job workers have resumed.',
            urgency: 'low',
            sound: false
          });
        } else if (!isOnline && !wasOffline) {
          // TRANSITION: Online -> Offline
          console.log('🟡 [Network] Internet disconnected. Entering local offline mode...');
          agentStore.addLog('system', '🟡 Offline mode active: Network disconnected. Tasks will queue locally until reconnected.');

          this.emit('offline');

          await notificationService.sendDesktopNotification({
            title: '🟡 Offline Mode Active',
            subtitle: 'AI Desktop Assistant',
            message: 'Running locally on your laptop. All local data and alerts remain active.',
            urgency: 'low',
            sound: false
          });
        }
      }
    }, intervalMs);
  }

  isOnline(): boolean {
    return this.online;
  }

  getStatus() {
    return {
      online: this.online,
      lastChecked: this.lastChecked,
      mode: this.online ? 'Online (Live sync)' : 'Offline (Local laptop mode)'
    };
  }
}

export const networkMonitorService = new NetworkMonitorService();
