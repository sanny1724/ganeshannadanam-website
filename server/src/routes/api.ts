import { Router } from 'express';
import { CareerController } from '../controllers/careerController.js';

const router = Router();

// System & Health
router.get('/health', CareerController.getHealth);

// Metadata Endpoints
router.get('/users', CareerController.getUsers);
router.get('/skills', CareerController.getSkills);
router.get('/job-roles', CareerController.getJobRoles);
router.get('/job-roles/:id', CareerController.getJobRoleById);
router.get('/domains', CareerController.getDomains);
router.get('/technologies', CareerController.getTechnologies);

// Core Graph Features (Parameterized Cypher Queries)
// Query 1: Discover matching jobs based on skills
router.post('/careers/recommendations', CareerController.matchCareers);

// Query 2: Skill gap analysis + topological learning roadmap
router.post('/skill-gap', CareerController.analyzeSkillGap);

// Query 3 & 4: Recommended projects, courses, certs for role
router.post('/recommendations/role', CareerController.getRoleRecommendations);

// Query 5 & 6: Multi-hop career path traversal
router.get('/career-path/:skillId', CareerController.discoverCareerPaths);

// Query 7: Interactive force-directed subgraph
router.get('/graph/subgraph', CareerController.getGraphSubgraph);

// Query 8: Alternative lateral career pivots
router.get('/careers/:roleId/alternatives', CareerController.getAlternativePivots);

// Critical Relational Comparison Benchmark
router.post('/cypher/benchmark', CareerController.getRelationalBenchmark);

// Interactive openCypher Query Lab runner
router.post('/cypher/run', CareerController.runCypher);

export default router;
