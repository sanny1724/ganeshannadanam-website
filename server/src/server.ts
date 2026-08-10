import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { cognodb } from './db/cognodb.js';
import { errorHandler } from './middleware/errorHandler.js';

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

// Mount REST API
app.use('/api', apiRouter);

// Health check root
app.get('/', (req, res) => {
  res.json({
    app: 'CareerGraph API',
    version: '1.0.0',
    description: 'Graph-powered Career & Skill Relationship Explorer for Wexa AI Take-Home',
    endpoints: {
      health: '/api/health',
      skills: '/api/skills',
      jobRoles: '/api/job-roles',
      careers: '/api/careers/recommendations',
      skillGap: '/api/skill-gap',
      careerPath: '/api/career-path/:skillId',
      graphExplorer: '/api/graph/subgraph',
      benchmark: '/api/cypher/benchmark'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server and initialize database
async function bootstrap() {
  console.log('======================================================');
  console.log('🚀 [CareerGraph Server] Starting Backend Service...');
  console.log('======================================================');

  await cognodb.init();

  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📡 Graph Engine: ${cognodb.getStatus().engine}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log('======================================================');
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
