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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const ApiService = {
  // System Health
  async getHealth(): Promise<{
    status: string;
    database: DatabaseStatus;
    graphStats: { nodeCount: number; edgeCount: number; nodeBreakdown: Record<string, number> };
  }> {
    const res = await api.get('/health');
    return res.data;
  },

  // Metadata
  async getUsers(): Promise<UserProfile[]> {
    const res = await api.get('/users');
    return res.data.users;
  },

  async getSkills(): Promise<Skill[]> {
    const res = await api.get('/skills');
    return res.data.skills;
  },

  async getJobRoles(): Promise<JobRole[]> {
    const res = await api.get('/job-roles');
    return res.data.jobRoles;
  },

  async getJobRoleById(id: string): Promise<JobRole> {
    const res = await api.get(`/job-roles/${id}`);
    return res.data.role;
  },

  async getDomains(): Promise<Domain[]> {
    const res = await api.get('/domains');
    return res.data.domains;
  },

  async getTechnologies(): Promise<Technology[]> {
    const res = await api.get('/technologies');
    return res.data.technologies;
  },

  // Core Features
  async getCareerRecommendations(
    userSkillIds: string[],
    domainFilter: string = 'all'
  ): Promise<{
    recommendations: CareerRecommendation[];
    cypherQuery: CypherQueryInfo;
  }> {
    const res = await api.post('/careers/recommendations', { userSkillIds, domainFilter });
    return res.data;
  },

  async getSkillGap(
    roleId: string,
    userSkillIds: string[]
  ): Promise<{
    data: SkillGapData;
    cypherQuery: CypherQueryInfo;
  }> {
    const res = await api.post('/skill-gap', { roleId, userSkillIds });
    return res.data;
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
    const res = await api.post('/recommendations/role', { roleId, userSkillIds });
    return res.data;
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
    const res = await api.get(`/career-path/${skillId}`);
    return res.data;
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
    const res = await api.get('/graph/subgraph', { params });
    return res.data;
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
    const res = await api.get(`/careers/${roleId}/alternatives`);
    return res.data;
  },

  async getRelationalBenchmark(userId: string): Promise<{
    user: { id: string; name: string; targetRole: string };
    resultsCount: number;
    results: any[];
    graphExecutionTimeMs: number;
    relationalComparison: any;
  }> {
    const res = await api.post('/cypher/benchmark', { userId });
    return res.data;
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
    const res = await api.post('/cypher/run', { cypher, params });
    return res.data;
  }
};
