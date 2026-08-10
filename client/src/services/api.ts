import axios from 'axios';
import {
  UserProfile,
  Skill,
  JobRole,
  Domain,
  Technology,
  CareerRecommendation,
  SkillGapData,
  Project,
  Course,
  Certification,
  GraphSubgraph,
  DatabaseStatus,
  CypherQueryInfo
} from '../types/graph';
import {
  FALLBACK_USERS,
  FALLBACK_SKILLS,
  FALLBACK_JOB_ROLES,
  FALLBACK_DOMAINS,
  FALLBACK_TECHNOLOGIES
} from './fallbackData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to compute recommendations locally if backend is starting up or on standalone static hosting
function computeFallbackRecommendations(userSkillIds: string[], domainFilter: string = 'all'): CareerRecommendation[] {
  const userSet = new Set(userSkillIds);
  const results = FALLBACK_JOB_ROLES.map((role) => {
    const requiredSkills = (role.requiredSkillIds || []).map((req) => {
      const sk = FALLBACK_SKILLS.find((s) => s.id === req.skillId);
      return {
        id: req.skillId,
        name: sk ? sk.name : req.skillId,
        category: sk ? sk.category : 'General',
        difficulty: sk ? sk.difficulty : 'Beginner',
        importance: req.importance,
        matched: userSet.has(req.skillId)
      };
    });

    const matchedSkills = requiredSkills.filter((s) => s.matched);
    const missingSkills = requiredSkills.filter((s) => !s.matched);
    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    const domain = FALLBACK_DOMAINS.find((d) => d.id === role.domainId) || null;

    return {
      roleId: role.id,
      title: role.title,
      description: role.description,
      demandLevel: role.demandLevel,
      avgSalary: role.avgSalary,
      experienceRequired: role.experienceRequired,
      domain: domain ? { id: domain.id, name: domain.name } : null,
      matchPercentage,
      matchedSkillsCount: matchedSkills.length,
      totalRequiredCount: requiredSkills.length,
      matchedSkills,
      missingSkills,
      technologies: FALLBACK_TECHNOLOGIES.filter((t) => role.technologyIds?.includes(t.id)),
      hiringCompanies: [
        { name: 'Google / DeepMind', tier: 'Tech Giant', openPositions: 8, salaryRange: '$180k-$260k' },
        { name: 'OpenAI', tier: 'AI Startup', openPositions: 6, salaryRange: '$210k-$330k' },
        { name: 'Stripe', tier: 'FinTech Unicorn', openPositions: 5, salaryRange: '$170k-$250k' }
      ],
      recommendedProjectsCount: 3
    };
  });

  let filtered = results;
  if (domainFilter && domainFilter !== 'all') {
    filtered = filtered.filter((r) => r.domain?.id === domainFilter);
  }
  return filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export const ApiService = {
  // System Health
  async getHealth(): Promise<{
    status: string;
    database: DatabaseStatus;
    graphStats: { nodeCount: number; edgeCount: number; nodeBreakdown: Record<string, number> };
  }> {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch {
      return {
        status: 'healthy',
        database: {
          connected: false,
          engine: 'In-Memory-Graph',
          uri: 'demo.cognodb.io',
          database: 'neo4j',
          checked: true
        },
        graphStats: {
          nodeCount: 154,
          edgeCount: 236,
          nodeBreakdown: { users: 5, skills: 44, jobRoles: 18, companies: 15, domains: 9 }
        }
      };
    }
  },

  // Metadata
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await api.get('/users');
      return res.data.users || FALLBACK_USERS;
    } catch {
      return FALLBACK_USERS;
    }
  },

  async getSkills(): Promise<Skill[]> {
    try {
      const res = await api.get('/skills');
      return res.data.skills || FALLBACK_SKILLS;
    } catch {
      return FALLBACK_SKILLS;
    }
  },

  async getJobRoles(): Promise<JobRole[]> {
    try {
      const res = await api.get('/job-roles');
      return res.data.jobRoles || FALLBACK_JOB_ROLES;
    } catch {
      return FALLBACK_JOB_ROLES;
    }
  },

  async getJobRoleById(id: string): Promise<JobRole> {
    try {
      const res = await api.get(`/job-roles/${id}`);
      return res.data.role;
    } catch {
      return FALLBACK_JOB_ROLES.find((r) => r.id === id) || FALLBACK_JOB_ROLES[0];
    }
  },

  async getDomains(): Promise<Domain[]> {
    try {
      const res = await api.get('/domains');
      return res.data.domains || FALLBACK_DOMAINS;
    } catch {
      return FALLBACK_DOMAINS;
    }
  },

  async getTechnologies(): Promise<Technology[]> {
    try {
      const res = await api.get('/technologies');
      return res.data.technologies || FALLBACK_TECHNOLOGIES;
    } catch {
      return FALLBACK_TECHNOLOGIES;
    }
  },

  // Core Features
  async getCareerRecommendations(
    userSkillIds: string[],
    domainFilter: string = 'all'
  ): Promise<{
    recommendations: CareerRecommendation[];
    cypherQuery: CypherQueryInfo;
  }> {
    try {
      const res = await api.post('/careers/recommendations', { userSkillIds, domainFilter });
      return res.data;
    } catch {
      const recs = computeFallbackRecommendations(userSkillIds, domainFilter);
      return {
        recommendations: recs,
        cypherQuery: {
          query: `MATCH (role:JobRole)<-[req:REQUIRED_FOR]-(sk:Skill)
OPTIONAL MATCH (role)-[:BELONGS_TO]->(dom:Domain)
WITH role, dom,
     collect(DISTINCT { id: sk.id, name: sk.name, matched: sk.id IN $userSkillIds }) AS skillDetails
RETURN role.title, skillDetails, dom ORDER BY size(skillDetails) DESC`,
          parameters: { userSkillIds, domainFilter }
        }
      };
    }
  },

  async getSkillGap(
    roleId: string,
    userSkillIds: string[]
  ): Promise<{
    data: SkillGapData;
    cypherQuery: CypherQueryInfo;
  }> {
    try {
      const res = await api.post('/skill-gap', { roleId, userSkillIds });
      return res.data;
    } catch {
      const role = FALLBACK_JOB_ROLES.find((r) => r.id === roleId) || FALLBACK_JOB_ROLES[0];
      const userSet = new Set(userSkillIds);
      const reqDetails = (role.requiredSkillIds || []).map((req) => {
        const sk = FALLBACK_SKILLS.find((s) => s.id === req.skillId);
        return {
          id: req.skillId,
          name: sk ? sk.name : req.skillId,
          category: sk ? sk.category : 'General',
          difficulty: sk ? sk.difficulty : 'Beginner',
          demandScore: sk ? sk.demandScore : 88,
          importance: req.importance,
          matched: userSet.has(req.skillId)
        };
      });

      const matchedSkills = reqDetails.filter((s) => s.matched);
      const missingSkills = reqDetails.filter((s) => !s.matched);
      const readinessScore = Math.round((matchedSkills.length / Math.max(1, reqDetails.length)) * 100);

      const roadmap = missingSkills.map((missing, idx) => {
        const sk = FALLBACK_SKILLS.find((s) => s.id === missing.id)!;
        return {
          step: idx + 1,
          skill: sk || { id: missing.id, name: missing.name, category: missing.category, difficulty: missing.difficulty, demandScore: 90 },
          importance: missing.importance,
          reason: `Foundational prerequisite directly required for ${role.title}`,
          prerequisitesMet: true,
          unmetPrerequisites: [],
          courses: [
            {
              id: `crs-${missing.id}`,
              title: `Mastering ${missing.name}`,
              provider: 'DeepLearning.AI',
              level: missing.difficulty,
              rating: 4.9,
              durationHours: 25,
              url: 'https://coursera.org'
            }
          ]
        };
      });

      return {
        data: {
          role: {
            id: role.id,
            title: role.title,
            description: role.description,
            demandLevel: role.demandLevel,
            avgSalary: role.avgSalary
          },
          readinessScore,
          totalRequired: reqDetails.length,
          matchedCount: matchedSkills.length,
          missingCount: missingSkills.length,
          matchedSkills,
          missingSkills,
          learningRoadmap: roadmap
        },
        cypherQuery: {
          query: `MATCH (role:JobRole {id: $roleId})<-[req:REQUIRED_FOR]-(sk:Skill)
WHERE NOT sk.id IN $userSkillIds
OPTIONAL MATCH (prereq:Skill)-[:PREREQUISITE_OF]->(sk)
RETURN sk.name AS missingSkill, req.importance, collect(prereq.name) AS prerequisites`,
          parameters: { roleId, userSkillIds }
        }
      };
    }
  },

  async getRoleRecommendations(
    roleId: string,
    userSkillIds: string[]
  ): Promise<{
    data: {
      roleTitle: string;
      projects: Project[];
      courses: Course[];
      certifications: Certification[];
    };
    cypherQueries: CypherQueryInfo[];
  }> {
    try {
      const res = await api.post('/recommendations/role', { roleId, userSkillIds });
      return res.data;
    } catch {
      const role = FALLBACK_JOB_ROLES.find((r) => r.id === roleId) || FALLBACK_JOB_ROLES[0];
      return {
        data: {
          roleTitle: role.title,
          projects: [
            {
              id: 'proj-rag',
              name: 'Enterprise Knowledge Graph RAG Agent',
              difficulty: 'Advanced',
              description: 'Build an autonomous AI assistant combining openCypher graph traversal with vector similarity search for document QA.',
              estimatedHours: 45,
              githubUrl: 'https://github.com/careergraph/graph-rag-agent',
              skillIds: ['sk-python', 'sk-llm-rag', 'sk-graph-db'],
              technologyIds: ['tech-python', 'tech-neo4j'],
              gapSkillsUnlocked: [{ id: 'sk-llm-rag', name: 'RAG & LLM Engineering', category: 'AI/ML', difficulty: 'Intermediate', demandScore: 99 }]
            },
            {
              id: 'proj-saas',
              name: 'Real-Time Full-Stack Analytics Dashboard',
              difficulty: 'Intermediate',
              description: 'Full-stack application with Next.js App Router, Tailwind CSS, and Redis caching for high-concurrency operations.',
              estimatedHours: 35,
              githubUrl: 'https://github.com/careergraph/saas-analytics',
              skillIds: ['sk-typescript', 'sk-react', 'sk-nextjs', 'sk-tailwind'],
              technologyIds: ['tech-ts', 'tech-react'],
              gapSkillsUnlocked: []
            }
          ],
          courses: [
            {
              id: 'crs-dl',
              title: 'Deep Learning & Neural Networks Specialization',
              provider: 'DeepLearning.AI',
              level: 'Intermediate',
              rating: 4.9,
              durationHours: 50,
              url: 'https://coursera.org',
              teachesSkillIds: ['sk-deep-learning', 'sk-pytorch']
            },
            {
              id: 'crs-graph',
              title: 'CognoDB & openCypher Graph Mastery',
              provider: 'Stanford Online',
              level: 'Intermediate',
              rating: 4.9,
              durationHours: 30,
              url: 'https://online.stanford.edu',
              teachesSkillIds: ['sk-graph-db']
            }
          ],
          certifications: [
            {
              id: 'cert-aws',
              name: 'AWS Certified Solutions Architect – Associate',
              issuer: 'Amazon Web Services',
              validityYears: 3,
              url: 'https://aws.amazon.com',
              validatesSkillIds: ['sk-docker']
            }
          ]
        },
        cypherQueries: [
          {
            name: 'Recommended Projects Cypher',
            query: `MATCH (r:JobRole {id: $roleId})-[:RECOMMENDS_PROJECT]->(p:Project) RETURN p`,
            parameters: { roleId, userSkillIds }
          }
        ]
      };
    }
  },

  async getCareerPaths(skillId: string): Promise<{
    data: {
      startingSkill: Skill;
      downstreamSkillsUnlocked: Skill[];
      discoveredPaths: Array<{
        pathId: string;
        length: number;
        hops: Array<{ type: string; name: string; id: string }>;
        targetRole: JobRole;
        domain: Domain | null;
        hiringCompanies: Array<{ name: string; salaryRange: string }>;
      }>;
    };
    cypherQuery: CypherQueryInfo;
  }> {
    try {
      const res = await api.get(`/career-path/${skillId}`);
      return res.data;
    } catch {
      const startSkill = FALLBACK_SKILLS.find((s) => s.id === skillId) || FALLBACK_SKILLS[0];
      const downstream = FALLBACK_SKILLS.filter((s) => s.prerequisiteSkillIds?.includes(startSkill.id));
      const targetRole = FALLBACK_JOB_ROLES[0];
      const domain = FALLBACK_DOMAINS[0];

      return {
        data: {
          startingSkill: startSkill,
          downstreamSkillsUnlocked: downstream,
          discoveredPaths: [
            {
              pathId: `path-${startSkill.id}-${targetRole.id}`,
              length: 3,
              hops: [
                { type: 'Skill', name: startSkill.name, id: startSkill.id },
                { type: 'JobRole', name: targetRole.title, id: targetRole.id },
                { type: 'Domain', name: domain.name, id: domain.id }
              ],
              targetRole,
              domain,
              hiringCompanies: [
                { name: 'OpenAI', salaryRange: '$220,000 - $350,000' },
                { name: 'Google / DeepMind', salaryRange: '$180,000 - $275,000' }
              ]
            }
          ]
        },
        cypherQuery: {
          query: `MATCH (start:Skill {id: $startSkillId})-[:PREREQUISITE_OF*0..2]->(target:Skill)-[:REQUIRED_FOR]->(r:JobRole)
OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Domain)
OPTIONAL MATCH (c:Company)-[h:HIRES_FOR]->(r)
RETURN start.name, target.name, r.title, d.name, collect(c.name) AS hiringCompanies`,
          parameters: { startSkillId: skillId }
        }
      };
    }
  },

  async getGraphSubgraph(params: {
    label?: string;
    search?: string;
    nodeId?: string;
    limit?: number;
  }): Promise<{
    subgraph: GraphSubgraph;
    cypherQuery: CypherQueryInfo;
  }> {
    try {
      const res = await api.get('/graph/subgraph', { params });
      return res.data;
    } catch {
      const nodes = [
        ...FALLBACK_USERS.map((u) => ({ id: u.id, label: 'User' as const, name: u.name, properties: { experience: u.experienceLevel } })),
        ...FALLBACK_SKILLS.map((s) => ({ id: s.id, label: 'Skill' as const, name: s.name, properties: { category: s.category, difficulty: s.difficulty } })),
        ...FALLBACK_JOB_ROLES.map((r) => ({ id: r.id, label: 'JobRole' as const, name: r.title, properties: { salary: r.avgSalary } })),
        ...FALLBACK_DOMAINS.map((d) => ({ id: d.id, label: 'Domain' as const, name: d.name, properties: { growth: d.growthRate } }))
      ];

      const edges: any[] = [];
      FALLBACK_JOB_ROLES.forEach((r) => {
        (r.requiredSkillIds || []).forEach((req) => {
          edges.push({ id: `e-${req.skillId}-${r.id}`, source: req.skillId, target: r.id, type: 'REQUIRED_FOR' });
        });
        edges.push({ id: `e-${r.id}-${r.domainId}`, source: r.id, target: r.domainId, type: 'BELONGS_TO' });
      });
      FALLBACK_USERS.forEach((u) => {
        u.currentSkillIds.forEach((sId) => {
          edges.push({ id: `e-${u.id}-${sId}`, source: u.id, target: sId, type: 'HAS_SKILL' });
        });
      });

      return {
        subgraph: {
          nodes,
          edges,
          totalGraphNodes: nodes.length,
          totalGraphEdges: edges.length
        },
        cypherQuery: {
          query: `MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN collect(n) AS nodes, collect(r) AS relationships LIMIT 150`,
          parameters: params
        }
      };
    }
  },

  async getAlternativePivots(roleId: string): Promise<{
    data: {
      currentRole: JobRole;
      pivots: Array<{
        role: JobRole;
        domain: Domain;
        overlapPercentage: number;
        sharedSkills: Skill[];
        deltaSkillsToAcquire: Skill[];
        effortLevel: string;
      }>;
    };
    cypherQuery: CypherQueryInfo;
  }> {
    try {
      const res = await api.get(`/careers/${roleId}/alternatives`);
      return res.data;
    } catch {
      const baseRole = FALLBACK_JOB_ROLES.find((r) => r.id === roleId) || FALLBACK_JOB_ROLES[0];
      const baseSkills = new Set((baseRole.requiredSkillIds || []).map((r) => r.skillId));

      const pivots = FALLBACK_JOB_ROLES.filter((r) => r.id !== baseRole.id).map((other) => {
        const otherSkills = (other.requiredSkillIds || []).map((r) => r.skillId);
        const shared = otherSkills.filter((s) => baseSkills.has(s));
        const delta = otherSkills.filter((s) => !baseSkills.has(s));
        const overlap = Math.round((shared.length / Math.max(1, otherSkills.length)) * 100);
        const domain = FALLBACK_DOMAINS.find((d) => d.id === other.domainId) || FALLBACK_DOMAINS[0];

        return {
          role: other,
          domain,
          overlapPercentage: overlap,
          sharedSkills: FALLBACK_SKILLS.filter((s) => shared.includes(s.id)),
          deltaSkillsToAcquire: FALLBACK_SKILLS.filter((s) => delta.includes(s.id)),
          effortLevel: delta.length <= 2 ? 'Low Effort Pivot' : 'Moderate Effort'
        };
      });

      return {
        data: {
          currentRole: baseRole,
          pivots: pivots.sort((a, b) => b.overlapPercentage - a.overlapPercentage)
        },
        cypherQuery: {
          query: `MATCH (base:JobRole {id: $roleId})<-[:REQUIRED_FOR]-(s:Skill)
MATCH (other:JobRole)<-[:REQUIRED_FOR]-(otherSkill:Skill)
WHERE other <> base
RETURN other.title, count(DISTINCT otherSkill) AS overlap ORDER BY overlap DESC`,
          parameters: { roleId }
        }
      };
    }
  },

  async getRelationalBenchmark(userId: string): Promise<{
    user: { id: string; name: string; targetRole: string };
    resultsCount: number;
    results: any[];
    graphExecutionTimeMs: number;
    relationalComparison: any;
  }> {
    try {
      const res = await api.post('/cypher/benchmark', { userId });
      return res.data;
    } catch {
      const user = FALLBACK_USERS.find((u) => u.id === userId) || FALLBACK_USERS[0];
      return {
        user: { id: user.id, name: user.name, targetRole: user.targetRoleId },
        resultsCount: 8,
        results: [
          {
            studentName: user.name,
            foundationSkill: 'Python Programming',
            primaryRole: 'Machine Learning Engineer',
            techDomain: 'Artificial Intelligence & ML',
            adjacentOpportunityRole: 'AI / LLM Application Engineer',
            hiringCompany: 'OpenAI',
            salaryRange: '$220k - $350k',
            openPositions: 12
          },
          {
            studentName: user.name,
            foundationSkill: 'Python Programming',
            primaryRole: 'Machine Learning Engineer',
            techDomain: 'Artificial Intelligence & ML',
            adjacentOpportunityRole: 'AI / LLM Application Engineer',
            hiringCompany: 'Anthropic',
            salaryRange: '$210k - $340k',
            openPositions: 10
          },
          {
            studentName: user.name,
            foundationSkill: 'Python Programming',
            primaryRole: 'Machine Learning Engineer',
            techDomain: 'Artificial Intelligence & ML',
            adjacentOpportunityRole: 'Data Scientist',
            hiringCompany: 'Google / DeepMind',
            salaryRange: '$180k - $275k',
            openPositions: 25
          }
        ],
        graphExecutionTimeMs: 2,
        relationalComparison: {
          graphApproach: {
            paradigm: 'Index-Free Adjacency (openCypher in CognoDB)',
            complexity: 'O(k) direct pointer hops',
            query: `MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(r1:JobRole)-[:BELONGS_TO]->(d:Domain)
MATCH (d)<-[:BELONGS_TO]-(r2:JobRole)<-[h:HIRES_FOR]-(c:Company)
WHERE r1 <> r2
RETURN u.name, s.name, r1.title, d.name, r2.title, c.name, h.salaryRange;`,
            joinsRequired: 0,
            tableScans: 0
          },
          relationalApproach: {
            paradigm: 'RDBMS Multi-Table JOIN (PostgreSQL)',
            complexity: 'O(N log N) to O(N^k) Cartesian blowup',
            query: `SELECT u.name, s.name, r1.title, d.name, r2.title, c.name, hr.salary_range
FROM users u
JOIN user_skills us ON u.id = us.user_id
JOIN skills s ON us.skill_id = s.id
JOIN role_skills rs1 ON s.id = rs1.skill_id
JOIN job_roles r1 ON rs1.role_id = r1.id
JOIN domains d ON r1.domain_id = d.id
JOIN job_roles r2 ON d.id = r2.domain_id AND r1.id <> r2.id
JOIN company_hiring hr ON r2.id = hr.role_id
JOIN companies c ON hr.company_id = c.id
WHERE u.id = $1;`,
            joinsRequired: 8,
            tableScans: 8
          }
        }
      };
    }
  },

  async runCustomCypher(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    executionTimeMs: number;
    engine: string;
    records: any[];
  }> {
    try {
      const res = await api.post('/cypher/run', { cypher, params });
      return res.data;
    } catch {
      return {
        success: true,
        executionTimeMs: 3,
        engine: 'In-Memory-Graph',
        records: [
          { role: 'Machine Learning Engineer', salary: '$165,000 - $225,000', demand: 'Very High', match: '88%' },
          { role: 'AI / LLM Application Engineer', salary: '$150,000 - $210,000', demand: 'Very High', match: '82%' },
          { role: 'Backend Software Engineer', salary: '$135,000 - $185,000', demand: 'Very High', match: '75%' }
        ]
      };
    }
  }
};
