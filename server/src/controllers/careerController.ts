import { Request, Response, NextFunction } from 'express';
import { cognodb } from '../db/cognodb.js';
import { inMemoryGraphEngine } from '../db/inMemoryEngine.js';
import { CYPHER_QUERIES } from '../queries/careerQueries.js';
import { USERS, SKILLS, JOB_ROLES, DOMAINS, TECHNOLOGIES, COMPANIES, PROJECTS, COURSES, CERTIFICATIONS } from '../db/seedData.js';

export class CareerController {
  // Health & Database Status
  public static async getHealth(req: Request, res: Response) {
    const status = cognodb.getStatus();
    const stats = inMemoryGraphEngine.getStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: status,
      graphStats: stats
    });
  }

  // List all users
  public static async getUsers(req: Request, res: Response) {
    res.json({ users: USERS });
  }

  // List all skills
  public static async getSkills(req: Request, res: Response) {
    res.json({ skills: SKILLS });
  }

  // List all job roles
  public static async getJobRoles(req: Request, res: Response) {
    const rolesWithDetails = JOB_ROLES.map((r) => {
      const domain = DOMAINS.find((d) => d.id === r.domainId);
      const reqSkills = r.requiredSkillIds.map((req) => ({
        ...req,
        skill: SKILLS.find((s) => s.id === req.skillId)
      }));
      const hiring = COMPANIES.filter((c) => c.hiringRoles.some((hr) => hr.roleId === r.id));
      return {
        ...r,
        domain,
        requiredSkills: reqSkills,
        hiringCompanies: hiring
      };
    });
    res.json({ jobRoles: rolesWithDetails });
  }

  // Single Job Role
  public static async getJobRoleById(req: Request, res: Response) {
    const { id } = req.params;
    const role = JOB_ROLES.find((r) => r.id === id);
    if (!role) {
      res.status(404).json({ error: `Job role '${id}' not found.` });
      return;
    }
    const domain = DOMAINS.find((d) => d.id === role.domainId);
    const reqSkills = role.requiredSkillIds.map((req) => ({
      ...req,
      skill: SKILLS.find((s) => s.id === req.skillId)
    }));
    const hiring = COMPANIES.filter((c) => c.hiringRoles.some((hr) => hr.roleId === role.id));
    const projects = PROJECTS.filter((p) => p.recommendedForRoleIds.includes(role.id));

    res.json({
      role: {
        ...role,
        domain,
        requiredSkills: reqSkills,
        hiringCompanies: hiring,
        recommendedProjects: projects
      }
    });
  }

  // List all domains
  public static async getDomains(req: Request, res: Response) {
    res.json({ domains: DOMAINS });
  }

  // List all technologies
  public static async getTechnologies(req: Request, res: Response) {
    res.json({ technologies: TECHNOLOGIES });
  }

  // QUERY 1: Match Careers given user skills & domain
  public static async matchCareers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userSkillIds = [], domainFilter = 'all' } = req.body;

      if (!Array.isArray(userSkillIds)) {
        res.status(400).json({ error: 'userSkillIds must be an array of skill IDs' });
        return;
      }

      // Execute via Graph Engine
      const matches = inMemoryGraphEngine.matchCareers(userSkillIds, domainFilter);

      res.json({
        success: true,
        count: matches.length,
        recommendations: matches,
        cypherQuery: {
          query: CYPHER_QUERIES.MATCH_CAREERS_BY_SKILLS.trim(),
          parameters: { userSkillIds, domainFilter }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // QUERY 2: Skill Gap Analyzer with Topological Learning Order
  public static async analyzeSkillGap(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, userSkillIds = [] } = req.body;

      if (!roleId) {
        res.status(400).json({ error: 'roleId is required.' });
        return;
      }

      const gapData = inMemoryGraphEngine.getSkillGap(roleId, userSkillIds);

      res.json({
        success: true,
        data: gapData,
        cypherQuery: {
          query: CYPHER_QUERIES.FIND_SKILL_GAPS_FOR_ROLE.trim(),
          parameters: { roleId, userSkillIds }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // QUERY 3 & 4: Recommended Projects & Courses
  public static async getRoleRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, userSkillIds = [] } = req.body;

      if (!roleId) {
        res.status(400).json({ error: 'roleId is required.' });
        return;
      }

      const recs = inMemoryGraphEngine.getRecommendationsForRole(roleId, userSkillIds);

      res.json({
        success: true,
        data: recs,
        cypherQueries: [
          {
            name: 'Recommended Projects Cypher',
            query: CYPHER_QUERIES.FIND_RECOMMENDED_PROJECTS.trim(),
            parameters: { roleId, userSkillIds }
          },
          {
            name: 'Targeted Courses Cypher',
            query: CYPHER_QUERIES.FIND_COURSES_AND_CERTS.trim(),
            parameters: { skillIds: 'Extracted Missing Skills' }
          }
        ]
      });
    } catch (err) {
      next(err);
    }
  }

  // QUERY 5 & 6: Career Path Multi-Hop Discovery
  public static async discoverCareerPaths(req: Request, res: Response, next: NextFunction) {
    try {
      const skillId = Array.isArray(req.params.skillId) ? req.params.skillId[0] : req.params.skillId;

      if (!skillId) {
        res.status(400).json({ error: 'skillId is required.' });
        return;
      }

      const pathData = inMemoryGraphEngine.discoverCareerPaths(skillId);

      res.json({
        success: true,
        data: pathData,
        cypherQuery: {
          query: CYPHER_QUERIES.DEEP_CAREER_PATH_TRAVERSAL.trim(),
          parameters: { startSkillId: skillId }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // QUERY 7: Subgraph for Interactive Graph Explorer
  public static async getGraphSubgraph(req: Request, res: Response, next: NextFunction) {
    try {
      const label = (req.query.label as string) || 'All';
      const search = (req.query.search as string) || '';
      const nodeId = (req.query.nodeId as string) || '';
      const limit = parseInt((req.query.limit as string) || '200', 10);

      const subgraph = inMemoryGraphEngine.getGraphSubgraph({
        labelFilter: label,
        searchQuery: search,
        selectedNodeId: nodeId,
        maxNodes: limit
      });

      res.json({
        success: true,
        subgraph,
        cypherQuery: {
          query: CYPHER_QUERIES.EXTRACT_GRAPH_SUBGRAPH.trim(),
          parameters: { label, search, nodeId, limit }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // QUERY 8: Alternative Lateral Career Pivots
  public static async getAlternativePivots(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = Array.isArray(req.params.roleId) ? req.params.roleId[0] : req.params.roleId;
      const pivotData = inMemoryGraphEngine.getAlternativePivots(roleId);

      res.json({
        success: true,
        data: pivotData,
        cypherQuery: {
          query: CYPHER_QUERIES.FIND_ALTERNATIVE_PIVOT_ROLES.trim(),
          parameters: { roleId }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // CRITICAL QUERY: Relational vs Graph Benchmark Comparison
  public static async getRelationalBenchmark(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId = 'usr-alex' } = req.body;
      const user = USERS.find((u) => u.id === userId) || USERS[0];

      // Execute 6-hop graph query simulation
      const startTime = Date.now();

      // Find user skills -> roles -> domains -> other roles in same domain -> hiring companies
      const userSkillIds = new Set(user.currentSkillIds);
      const matchedRoles = JOB_ROLES.filter((r) =>
        r.requiredSkillIds.some((req) => userSkillIds.has(req.skillId))
      );

      const results: any[] = [];
      matchedRoles.forEach((r1) => {
        const domain = DOMAINS.find((d) => d.id === r1.domainId);
        // Find sibling roles in same domain
        const siblingRoles = JOB_ROLES.filter((r2) => r2.domainId === r1.domainId && r2.id !== r1.id);
        siblingRoles.forEach((r2) => {
          const comps = COMPANIES.filter((c) => c.hiringRoles.some((hr) => hr.roleId === r2.id));
          comps.forEach((c) => {
            const hr = c.hiringRoles.find((h) => h.roleId === r2.id)!;
            results.push({
              studentName: user.name,
              foundationSkill: SKILLS.find((s) => userSkillIds.has(s.id))?.name || 'Python',
              primaryRole: r1.title,
              techDomain: domain?.name || 'General',
              adjacentOpportunityRole: r2.title,
              hiringCompany: c.name,
              companyTier: c.tier,
              salaryRange: hr.salaryRange,
              openPositions: hr.openPositions
            });
          });
        });
      });

      const executionTime = Math.max(1, Date.now() - startTime);

      res.json({
        success: true,
        user: { id: user.id, name: user.name, targetRole: user.targetRoleId },
        resultsCount: results.length,
        results: results.slice(0, 15),
        graphExecutionTimeMs: executionTime,
        relationalComparison: {
          graphApproach: {
            paradigm: 'Index-Free Adjacency (openCypher in CognoDB)',
            complexity: 'O(k) where k is number of outgoing pointers (sub-millisecond pointer hops)',
            query: CYPHER_QUERIES.RELATIONAL_COMPARISON_QUERY.trim(),
            joinsRequired: 0,
            tableScans: 0,
            executionProfile: 'Traverses direct memory pointers from User -> Skill -> Role -> Domain -> Role2 -> Company.'
          },
          relationalApproach: {
            paradigm: 'RDBMS Multi-Table JOIN (PostgreSQL / MySQL)',
            complexity: 'O(N * log N) to O(N^k) with recursive joins and Cartesian product expansions',
            query: `
SELECT 
  u.name AS student_name,
  s.name AS foundation_skill,
  r1.title AS primary_role,
  d.name AS tech_domain,
  r2.title AS adjacent_role,
  c.name AS hiring_company,
  hr.salary_range,
  hr.open_positions
FROM users u
JOIN user_skills us ON u.id = us.user_id
JOIN skills s ON us.skill_id = s.id
JOIN role_skills rs1 ON s.id = rs1.skill_id
JOIN job_roles r1 ON rs1.role_id = r1.id
JOIN domains d ON r1.domain_id = d.id
JOIN job_roles r2 ON d.id = r2.domain_id AND r1.id <> r2.id
JOIN company_hiring hr ON r2.id = hr.role_id
JOIN companies c ON hr.company_id = c.id
WHERE u.id = $1
ORDER BY c.name ASC
LIMIT 20;
            `.trim(),
            joinsRequired: 8,
            tableScans: 'Requires scanning/indexing 8 distinct join tables + intermediate hash joins',
            drawbacks: [
              'Combinatorial explosion in memory buffers when joining 8 foreign-key tables',
              'Performance degrades exponentially as dataset grows to millions of users and skills',
              'Rigid relational schema requires complex migration scripts for any new edge type (e.g. PREREQUISITE_OF)'
            ]
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  // Safe openCypher execution endpoint for Query Lab
  public static async runCypher(req: Request, res: Response, next: NextFunction) {
    try {
      const { cypher, params = {} } = req.body;

      if (!cypher || typeof cypher !== 'string') {
        res.status(400).json({ error: 'cypher query string is required.' });
        return;
      }

      // Read-only safety guard
      const forbidden = ['DELETE', 'DETACH', 'DROP', 'REMOVE', 'CREATE', 'SET', 'MERGE'];
      const upper = cypher.toUpperCase();
      const hasWrite = forbidden.some((w) => upper.includes(w));

      if (hasWrite) {
        res.status(403).json({
          error: 'Query Lab only allows read-only openCypher queries (MATCH, RETURN, WITH, WHERE, ORDER BY, LIMIT).'
        });
        return;
      }

      const result = await cognodb.executeCypher(cypher, params);
      res.json({
        success: true,
        executionTimeMs: result.executionTimeMs,
        engine: result.engine,
        records: result.records
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Cypher query execution error' });
    }
  }
}
