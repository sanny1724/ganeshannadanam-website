import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import agentRouter from './routes/agentRoutes.js';
import apiRouter from './routes/api.js';
import annadanamRouter from './routes/annadanamRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { autonomousDaemonService } from './services/autonomousDaemonService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Mount REST APIs
app.use('/api/annadanams', annadanamRouter);
app.use('/api/agent', agentRouter);
app.use('/api', apiRouter);

// Health check & browser redirect root
app.get('/', (req, res) => {
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
  if (acceptsHtml) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AI Desktop Assistant API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            background-color: #030712;
            color: #f3f4f6;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 24px;
            padding: 40px;
            max-width: 540px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.1);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 8px 0;
          }
          p {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 28px 0;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #06b6d4);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 14px;
            font-weight: 700;
            font-size: 15px;
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
            transition: transform 0.15s ease;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
          .note {
            margin-top: 24px;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend Agent Engine Online</div>
          <h1>AI Desktop Assistant</h1>
          <p>This is the background API service (Port 5001). To use the interactive visual Dashboard, open the frontend app below:</p>
          <a class="btn" href="http://localhost:5173">🚀 Open Visual Dashboard (Port 5173)</a>
          <div class="note">URL: <strong>http://localhost:5173</strong></div>
        </div>
      </body>
      </html>
    `);
  }

  res.json({
    app: 'AI Desktop Assistant API',
    version: '1.0.0',
    description: 'Autonomous Job Hunter Bot & Intelligent Email Monitor Agent for your Laptop',
    status: 'online',
    dashboardUrl: 'http://localhost:5173',
    endpoints: {
      status: '/api/agent/status',
      jobs: '/api/agent/jobs',
      searchJobs: '/api/agent/jobs/search',
      emails: '/api/agent/emails/alerts',
      scanEmails: '/api/agent/emails/scan',
      simulateEmail: '/api/agent/emails/simulate',
      profile: '/api/agent/profile',
      settings: '/api/agent/settings',
      testNotification: '/api/agent/notifications/test',
      logs: '/api/agent/logs'
    }
  });
});

import { notificationService } from './services/notificationService.js';
import { networkMonitorService } from './services/networkMonitorService.js';

// Error handling middleware
app.use(errorHandler);

// Start server
async function bootstrap() {
  console.log('======================================================');
  console.log('🤖 [AI Desktop Assistant] Local Laptop Engine Starting...');
  console.log('======================================================');

  app.listen(PORT, async () => {
    console.log(`🌐 Assistant API running on http://localhost:${PORT}`);
    console.log(`📡 Agent Status: http://localhost:${PORT}/api/agent/status`);
    console.log(`🔔 Windows Toast & Offline Engine: Ready`);
    console.log('======================================================');

    // Trigger instant wake-up notification on your laptop
    try {
      await notificationService.sendDesktopNotification({
        title: '🤖 AI Desktop Assistant Awake',
        subtitle: 'Local Daemon Active',
        message: 'Your personal Job Hunter & Email Radar is running locally on your laptop!',
        urgency: 'low',
        sound: false
      });
    } catch (e) {
      console.warn('Wakeup toast warning:', e);
    }
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
