export interface UserProfile {
  id: string;
  name: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Student';
  targetRoleId: string;
  bio: string;
  avatar: string;
  currentSkillIds: string[];
  interestedDomainIds: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'Programming' | 'Framework' | 'Database' | 'DevOps' | 'AI/ML' | 'Architecture' | 'Security';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  demandScore: number;
  technologyId?: string;
  prerequisiteSkillIds?: string[];
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  ecosystem: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  growthRate: string;
}

export interface CompanyHiring {
  id?: string;
  name: string;
  tier: string;
  openPositions: number;
  salaryRange: string;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  avgSalary: string;
  experienceRequired: string;
  domainId: string;
  domain?: Domain;
  requiredSkillIds?: { skillId: string; importance: 'Must-Have' | 'Good-to-Have' }[];
  technologyIds?: string[];
  requiredSkills?: Array<{
    skillId: string;
    importance: string;
    skill?: Skill;
  }>;
  hiringCompanies?: Array<{
    id: string;
    name: string;
    tier: string;
    hiringRoles: Array<{ roleId: string; openPositions: number; salaryRange: string }>;
  }>;
}

export interface CareerRecommendation {
  roleId: string;
  title: string;
  description: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  avgSalary: string;
  experienceRequired: string;
  domain: { id: string; name: string } | null;
  matchPercentage: number;
  matchedSkillsCount: number;
  totalRequiredCount: number;
  matchedSkills: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    importance: string;
    matched: boolean;
  }>;
  missingSkills: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    importance: string;
    matched: boolean;
  }>;
  technologies: Technology[];
  hiringCompanies: CompanyHiring[];
  recommendedProjectsCount: number;
}

export interface SkillGapData {
  role: {
    id: string;
    title: string;
    description: string;
    demandLevel: string;
    avgSalary: string;
    domain?: Domain;
  };
  readinessScore: number;
  totalRequired: number;
  matchedCount: number;
  missingCount: number;
  matchedSkills: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    demandScore: number;
    importance: string;
    matched: boolean;
  }>;
  missingSkills: Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    demandScore: number;
    importance: string;
    matched: boolean;
  }>;
  learningRoadmap: Array<{
    step: number;
    skill: Skill;
    importance: string;
    reason: string;
    prerequisitesMet: boolean;
    unmetPrerequisites: string[];
    courses: Array<{
      id: string;
      title: string;
      provider: string;
      level: string;
      rating: number;
      durationHours: number;
      url: string;
    }>;
  }>;
}

export interface Project {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  estimatedHours: number;
  githubUrl: string;
  skillIds: string[];
  technologyIds: string[];
  developedSkills?: Skill[];
  gapSkillsUnlocked?: Skill[];
  technologies?: Technology[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  level: string;
  rating: number;
  durationHours: number;
  url: string;
  teachesSkillIds: string[];
  skillsTaught?: Skill[];
  addressesMissingCount?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  validityYears: number;
  url: string;
  validatesSkillIds: string[];
  validatedSkills?: Skill[];
}

export interface GraphNode {
  id: string;
  label: 'User' | 'Skill' | 'Technology' | 'JobRole' | 'Company' | 'Project' | 'Course' | 'Certification' | 'Domain';
  name: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalGraphNodes: number;
  totalGraphEdges: number;
}

export interface CypherQueryInfo {
  query: string;
  parameters?: Record<string, any>;
  name?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  engine: 'CognoDB-Cloud' | 'In-Memory-Graph';
  uri: string;
  database: string;
  checked: boolean;
}
