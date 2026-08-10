import {
  USERS,
  SKILLS,
  TECHNOLOGIES,
  JOB_ROLES,
  COMPANIES,
  PROJECTS,
  COURSES,
  CERTIFICATIONS,
  DOMAINS,
  SkillNode,
  JobRoleNode,
  CompanyNode,
  ProjectNode,
  CourseNode,
  DomainNode
} from './seedData.js';

export interface GraphNode {
  id: string;
  label: 'User' | 'Skill' | 'Technology' | 'JobRole' | 'Company' | 'Project' | 'Course' | 'Certification' | 'Domain';
  name: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

class InMemoryGraphEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    // 1. Domains
    DOMAINS.forEach((d) => {
      this.nodes.set(d.id, {
        id: d.id,
        label: 'Domain',
        name: d.name,
        properties: { description: d.description, growthRate: d.growthRate }
      });
    });

    // 2. Technologies
    TECHNOLOGIES.forEach((t) => {
      this.nodes.set(t.id, {
        id: t.id,
        label: 'Technology',
        name: t.name,
        properties: { category: t.category, ecosystem: t.ecosystem, description: t.description }
      });
    });

    // 3. Skills
    SKILLS.forEach((s) => {
      this.nodes.set(s.id, {
        id: s.id,
        label: 'Skill',
        name: s.name,
        properties: { category: s.category, difficulty: s.difficulty, demandScore: s.demandScore }
      });

      if (s.technologyId) {
        this.edges.push({
          id: `e-${s.id}-partof-${s.technologyId}`,
          source: s.id,
          target: s.technologyId,
          type: 'PART_OF'
        });
      }

      if (s.prerequisiteSkillIds) {
        s.prerequisiteSkillIds.forEach((preId) => {
          this.edges.push({
            id: `e-${preId}-prereq-${s.id}`,
            source: preId,
            target: s.id,
            type: 'PREREQUISITE_OF'
          });
        });
      }
    });

    // 4. Job Roles
    JOB_ROLES.forEach((r) => {
      this.nodes.set(r.id, {
        id: r.id,
        label: 'JobRole',
        name: r.title,
        properties: {
          description: r.description,
          demandLevel: r.demandLevel,
          avgSalary: r.avgSalary,
          experienceRequired: r.experienceRequired
        }
      });

      // BELONGS_TO Domain
      this.edges.push({
        id: `e-${r.id}-belongs-${r.domainId}`,
        source: r.id,
        target: r.domainId,
        type: 'BELONGS_TO'
      });

      // REQUIRED_FOR
      r.requiredSkillIds.forEach((req) => {
        this.edges.push({
          id: `e-${req.skillId}-req-${r.id}`,
          source: req.skillId,
          target: r.id,
          type: 'REQUIRED_FOR',
          properties: { importance: req.importance }
        });
      });

      // USED_IN (Technology -> JobRole)
      r.technologyIds.forEach((techId) => {
        this.edges.push({
          id: `e-${techId}-usedin-${r.id}`,
          source: techId,
          target: r.id,
          type: 'USED_IN'
        });
      });
    });

    // 5. Companies
    COMPANIES.forEach((c) => {
      this.nodes.set(c.id, {
        id: c.id,
        label: 'Company',
        name: c.name,
        properties: { industry: c.industry, tier: c.tier, headquarters: c.headquarters }
      });

      c.hiringRoles.forEach((hr) => {
        this.edges.push({
          id: `e-${c.id}-hires-${hr.roleId}`,
          source: c.id,
          target: hr.roleId,
          type: 'HIRES_FOR',
          properties: { openPositions: hr.openPositions, salaryRange: hr.salaryRange }
        });
      });
    });

    // 6. Projects
    PROJECTS.forEach((p) => {
      this.nodes.set(p.id, {
        id: p.id,
        label: 'Project',
        name: p.name,
        properties: {
          difficulty: p.difficulty,
          description: p.description,
          estimatedHours: p.estimatedHours,
          githubUrl: p.githubUrl
        }
      });

      p.skillIds.forEach((skId) => {
        this.edges.push({
          id: `e-${p.id}-uses-sk-${skId}`,
          source: p.id,
          target: skId,
          type: 'USES_SKILL'
        });
      });

      p.technologyIds.forEach((techId) => {
        this.edges.push({
          id: `e-${p.id}-uses-tech-${techId}`,
          source: p.id,
          target: techId,
          type: 'USES_TECHNOLOGY'
        });
      });

      p.recommendedForRoleIds.forEach((roleId) => {
        this.edges.push({
          id: `e-${roleId}-recommends-${p.id}`,
          source: roleId,
          target: p.id,
          type: 'RECOMMENDS_PROJECT'
        });
      });
    });

    // 7. Courses
    COURSES.forEach((crs) => {
      this.nodes.set(crs.id, {
        id: crs.id,
        label: 'Course',
        name: crs.title,
        properties: {
          provider: crs.provider,
          level: crs.level,
          rating: crs.rating,
          durationHours: crs.durationHours,
          url: crs.url
        }
      });

      crs.teachesSkillIds.forEach((skId) => {
        this.edges.push({
          id: `e-${crs.id}-teaches-${skId}`,
          source: crs.id,
          target: skId,
          type: 'TEACHES'
        });
      });
    });

    // 8. Certifications
    CERTIFICATIONS.forEach((cert) => {
      this.nodes.set(cert.id, {
        id: cert.id,
        label: 'Certification',
        name: cert.name,
        properties: { issuer: cert.issuer, validityYears: cert.validityYears, url: cert.url }
      });

      cert.validatesSkillIds.forEach((skId) => {
        this.edges.push({
          id: `e-${cert.id}-validates-${skId}`,
          source: cert.id,
          target: skId,
          type: 'VALIDATES'
        });
      });
    });

    // 9. Users
    USERS.forEach((u) => {
      this.nodes.set(u.id, {
        id: u.id,
        label: 'User',
        name: u.name,
        properties: {
          experienceLevel: u.experienceLevel,
          targetRole: u.targetRoleId,
          bio: u.bio,
          avatar: u.avatar
        }
      });

      u.currentSkillIds.forEach((skId) => {
        this.edges.push({
          id: `e-${u.id}-hasskill-${skId}`,
          source: u.id,
          target: skId,
          type: 'HAS_SKILL'
        });
      });

      u.interestedDomainIds.forEach((domId) => {
        this.edges.push({
          id: `e-${u.id}-interested-${domId}`,
          source: u.id,
          target: domId,
          type: 'INTERESTED_IN'
        });
      });

      this.edges.push({
        id: `e-${u.id}-targets-${u.targetRoleId}`,
        source: u.id,
        target: u.targetRoleId,
        type: 'TARGETS_ROLE'
      });
    });
  }

  public getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
      nodeBreakdown: {
        users: USERS.length,
        skills: SKILLS.length,
        technologies: TECHNOLOGIES.length,
        jobRoles: JOB_ROLES.length,
        companies: COMPANIES.length,
        projects: PROJECTS.length,
        courses: COURSES.length,
        certifications: CERTIFICATIONS.length,
        domains: DOMAINS.length
      }
    };
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  // --- QUERY 1: Match Careers given user skills ---
  public matchCareers(userSkillIds: string[], domainFilter?: string) {
    const skillSet = new Set(userSkillIds);

    const matches = JOB_ROLES.map((role) => {
      const requiredSkills = role.requiredSkillIds.map((req) => {
        const sk = SKILLS.find((s) => s.id === req.skillId)!;
        return {
          id: req.skillId,
          name: sk ? sk.name : req.skillId,
          category: sk ? sk.category : 'General',
          difficulty: sk ? sk.difficulty : 'Beginner',
          importance: req.importance,
          matched: skillSet.has(req.skillId)
        };
      });

      const matchedSkills = requiredSkills.filter((s) => s.matched);
      const missingSkills = requiredSkills.filter((s) => !s.matched);
      const matchPercentage = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;

      // Find domain
      const domain = DOMAINS.find((d) => d.id === role.domainId);

      // Find hiring companies (via HIRES_FOR)
      const hiringCompanies = COMPANIES.filter((c) =>
        c.hiringRoles.some((hr) => hr.roleId === role.id)
      ).map((c) => {
        const hr = c.hiringRoles.find((h) => h.roleId === role.id)!;
        return {
          id: c.id,
          name: c.name,
          tier: c.tier,
          openPositions: hr.openPositions,
          salaryRange: hr.salaryRange
        };
      });

      // Find recommended projects (via RECOMMENDS_PROJECT)
      const recommendedProjects = PROJECTS.filter((p) =>
        p.recommendedForRoleIds.includes(role.id)
      );

      // Technologies used
      const techs = TECHNOLOGIES.filter((t) => role.technologyIds.includes(t.id));

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
        technologies: techs,
        hiringCompanies,
        recommendedProjectsCount: recommendedProjects.length
      };
    });

    let filtered = matches;
    if (domainFilter && domainFilter !== 'all') {
      filtered = filtered.filter((m) => m.domain?.id === domainFilter);
    }

    return filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  // --- QUERY 2: Skill Gap Analyzer with Topological Learning Order ---
  public getSkillGap(roleId: string, userSkillIds: string[]) {
    const role = JOB_ROLES.find((r) => r.id === roleId);
    if (!role) throw new Error(`Role not found: ${roleId}`);

    const userSkillSet = new Set(userSkillIds);
    const domain = DOMAINS.find((d) => d.id === role.domainId);

    const requiredSkillsDetails = role.requiredSkillIds.map((req) => {
      const sk = SKILLS.find((s) => s.id === req.skillId);
      const isMatched = userSkillSet.has(req.skillId);
      return {
        id: req.skillId,
        name: sk ? sk.name : req.skillId,
        category: sk ? sk.category : 'General',
        difficulty: sk ? sk.difficulty : 'Beginner',
        demandScore: sk ? sk.demandScore : 80,
        importance: req.importance,
        matched: isMatched,
        prerequisiteSkillIds: sk?.prerequisiteSkillIds || []
      };
    });

    const matchedSkills = requiredSkillsDetails.filter((s) => s.matched);
    const missingSkills = requiredSkillsDetails.filter((s) => !s.matched);
    const readinessScore = Math.round((matchedSkills.length / Math.max(1, requiredSkillsDetails.length)) * 100);

    // Topological Learning Roadmap based on PREREQUISITE_OF relationships
    // Build learning order DAG
    const learningOrder: Array<{
      step: number;
      skill: SkillNode;
      importance: string;
      reason: string;
      prerequisitesMet: boolean;
      unmetPrerequisites: string[];
      courses: CourseNode[];
    }> = [];

    // Sort missing skills by prerequisite dependencies and importance
    const missingSkillIds = new Set(missingSkills.map((s) => s.id));
    const processed = new Set<string>();

    let stepCounter = 1;
    let iteration = 0;
    while (processed.size < missingSkillIds.size && iteration < 10) {
      iteration++;
      for (const missing of missingSkills) {
        if (processed.has(missing.id)) continue;

        const skNode = SKILLS.find((s) => s.id === missing.id)!;
        const prereqs = skNode.prerequisiteSkillIds || [];
        const unmet = prereqs.filter((p) => !userSkillSet.has(p) && !processed.has(p));

        if (unmet.length === 0 || iteration > 3) {
          // Can learn now
          const courses = COURSES.filter((c) => c.teachesSkillIds.includes(skNode.id));
          learningOrder.push({
            step: stepCounter++,
            skill: skNode,
            importance: missing.importance,
            reason: prereqs.length > 0
              ? `Prerequisites satisfied. Direct requirement for ${role.title}`
              : `Foundational skill directly required for ${role.title}`,
            prerequisitesMet: unmet.length === 0,
            unmetPrerequisites: unmet.map((u) => SKILLS.find((s) => s.id === u)?.name || u),
            courses
          });
          processed.add(missing.id);
        }
      }
    }

    return {
      role: {
        id: role.id,
        title: role.title,
        description: role.description,
        demandLevel: role.demandLevel,
        avgSalary: role.avgSalary,
        domain
      },
      readinessScore,
      totalRequired: requiredSkillsDetails.length,
      matchedCount: matchedSkills.length,
      missingCount: missingSkills.length,
      matchedSkills,
      missingSkills,
      learningRoadmap: learningOrder
    };
  }

  // --- QUERY 3 & 4: Recommended Projects & Courses for Role ---
  public getRecommendationsForRole(roleId: string, userSkillIds: string[]) {
    const role = JOB_ROLES.find((r) => r.id === roleId);
    if (!role) throw new Error(`Role not found: ${roleId}`);

    const userSkillSet = new Set(userSkillIds);
    const missingSkillIds = role.requiredSkillIds
      .filter((req) => !userSkillSet.has(req.skillId))
      .map((r) => r.skillId);

    // Recommended Projects
    const roleProjects = PROJECTS.filter((p) => p.recommendedForRoleIds.includes(roleId));
    const projectResults = roleProjects.map((p) => {
      const developedSkills = SKILLS.filter((s) => p.skillIds.includes(s.id));
      const helpsCloseGaps = developedSkills.filter((s) => missingSkillIds.includes(s.id));
      const techs = TECHNOLOGIES.filter((t) => p.technologyIds.includes(t.id));
      return {
        ...p,
        developedSkills,
        gapSkillsUnlocked: helpsCloseGaps,
        technologies: techs
      };
    });

    // Recommended Courses
    const courseResults = COURSES.filter((c) =>
      c.teachesSkillIds.some((sId) => missingSkillIds.includes(sId) || role.requiredSkillIds.some((r) => r.skillId === sId))
    ).map((c) => {
      const skillsTaught = SKILLS.filter((s) => c.teachesSkillIds.includes(s.id));
      const addressesMissing = skillsTaught.filter((s) => missingSkillIds.includes(s.id));
      return {
        ...c,
        skillsTaught,
        addressesMissingCount: addressesMissing.length
      };
    }).sort((a, b) => b.addressesMissingCount - a.addressesMissingCount);

    // Relevant Certifications
    const certResults = CERTIFICATIONS.filter((cert) =>
      cert.validatesSkillIds.some((sId) => role.requiredSkillIds.some((r) => r.skillId === sId))
    ).map((cert) => {
      const validatedSkills = SKILLS.filter((s) => cert.validatesSkillIds.includes(s.id));
      return {
        ...cert,
        validatedSkills
      };
    });

    return {
      roleTitle: role.title,
      projects: projectResults,
      courses: courseResults,
      certifications: certResults
    };
  }

  // --- QUERY 5 & 6: Multi-Hop Career Traversal ---
  public discoverCareerPaths(startSkillId: string) {
    const startSkill = SKILLS.find((s) => s.id === startSkillId);
    if (!startSkill) throw new Error(`Skill not found: ${startSkillId}`);

    // Direct roles requiring this skill
    const directRoles = JOB_ROLES.filter((r) =>
      r.requiredSkillIds.some((req) => req.skillId === startSkillId)
    );

    // Skills where startSkill is a prerequisite (1-hop skill expansion)
    const downstreamSkills = SKILLS.filter((s) =>
      s.prerequisiteSkillIds?.includes(startSkillId)
    );

    // Roles requiring downstream skills (2-hop role expansion)
    const downstreamRoles = JOB_ROLES.filter((r) =>
      downstreamSkills.some((ds) => r.requiredSkillIds.some((req) => req.skillId === ds.id))
    );

    // Build multi-hop path objects
    const paths: Array<{
      pathId: string;
      length: number;
      hops: Array<{ type: string; name: string; id: string; category?: string }>;
      targetRole: JobRoleNode;
      domain: DomainNode | null;
      hiringCompanies: Array<{ name: string; salaryRange: string }>;
    }> = [];

    // Direct paths: Skill -> REQUIRED_FOR -> JobRole -> BELONGS_TO -> Domain -> HIRES_FOR -> Company
    directRoles.forEach((role) => {
      const domain = DOMAINS.find((d) => d.id === role.domainId) || null;
      const comps = COMPANIES.filter((c) =>
        c.hiringRoles.some((hr) => hr.roleId === role.id)
      ).map((c) => ({
        name: c.name,
        salaryRange: c.hiringRoles.find((hr) => hr.roleId === role.id)!.salaryRange
      }));

      paths.push({
        pathId: `path-${startSkill.id}-${role.id}`,
        length: 3,
        hops: [
          { type: 'Skill', name: startSkill.name, id: startSkill.id, category: startSkill.category },
          { type: 'JobRole', name: role.title, id: role.id },
          { type: 'Domain', name: domain?.name || 'General', id: domain?.id || '' }
        ],
        targetRole: role,
        domain,
        hiringCompanies: comps
      });
    });

    // Deep paths: Skill -> PREREQUISITE_OF -> Advanced Skill -> REQUIRED_FOR -> JobRole
    downstreamSkills.forEach((advSkill) => {
      const advRoles = JOB_ROLES.filter((r) =>
        r.requiredSkillIds.some((req) => req.skillId === advSkill.id)
      );

      advRoles.forEach((role) => {
        const domain = DOMAINS.find((d) => d.id === role.domainId) || null;
        const comps = COMPANIES.filter((c) =>
          c.hiringRoles.some((hr) => hr.roleId === role.id)
        ).map((c) => ({
          name: c.name,
          salaryRange: c.hiringRoles.find((hr) => hr.roleId === role.id)!.salaryRange
        }));

        paths.push({
          pathId: `path-deep-${startSkill.id}-${advSkill.id}-${role.id}`,
          length: 4,
          hops: [
            { type: 'Skill (Foundational)', name: startSkill.name, id: startSkill.id },
            { type: 'Skill (Advanced)', name: advSkill.name, id: advSkill.id },
            { type: 'JobRole', name: role.title, id: role.id },
            { type: 'Domain', name: domain?.name || 'Tech', id: domain?.id || '' }
          ],
          targetRole: role,
          domain,
          hiringCompanies: comps
        });
      });
    });

    return {
      startingSkill: startSkill,
      downstreamSkillsUnlocked: downstreamSkills,
      discoveredPaths: paths
    };
  }

  // --- QUERY 7: Full Subgraph for Graph Explorer ---
  public getGraphSubgraph(options: {
    selectedNodeId?: string;
    labelFilter?: string;
    searchQuery?: string;
    maxNodes?: number;
  }) {
    let nodes = Array.from(this.nodes.values());
    let edges = [...this.edges];

    // Filter by label
    if (options.labelFilter && options.labelFilter !== 'All') {
      nodes = nodes.filter((n) => n.label === options.labelFilter);
      const validNodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target));
    }

    // Search by name
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase();
      const matchedNodeIds = new Set<string>();
      nodes.forEach((n) => {
        if (n.name.toLowerCase().includes(q) || n.label.toLowerCase().includes(q)) {
          matchedNodeIds.add(n.id);
        }
      });

      // Expand 1 hop around matched nodes
      edges.forEach((e) => {
        if (matchedNodeIds.has(e.source)) matchedNodeIds.add(e.target);
        if (matchedNodeIds.has(e.target)) matchedNodeIds.add(e.source);
      });

      nodes = Array.from(this.nodes.values()).filter((n) => matchedNodeIds.has(n.id));
      edges = edges.filter((e) => matchedNodeIds.has(e.source) && matchedNodeIds.has(e.target));
    }

    // Expand neighborhood if specific node selected
    if (options.selectedNodeId) {
      const centerId = options.selectedNodeId;
      const neighborIds = new Set<string>([centerId]);

      this.edges.forEach((e) => {
        if (e.source === centerId) neighborIds.add(e.target);
        if (e.target === centerId) neighborIds.add(e.source);
      });

      nodes = Array.from(this.nodes.values()).filter((n) => neighborIds.has(n.id));
      edges = this.edges.filter((e) => neighborIds.has(e.source) && neighborIds.has(e.target));
    }

    const limit = options.maxNodes || 150;
    if (nodes.length > limit) {
      nodes = nodes.slice(0, limit);
      const keptIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));
    }

    return {
      nodes,
      edges,
      totalGraphNodes: this.nodes.size,
      totalGraphEdges: this.edges.length
    };
  }

  // --- QUERY 8: Alternative Lateral Career Pivots ---
  public getAlternativePivots(currentRoleId: string) {
    const baseRole = JOB_ROLES.find((r) => r.id === currentRoleId);
    if (!baseRole) throw new Error(`Role not found: ${currentRoleId}`);

    const baseSkillIds = new Set(baseRole.requiredSkillIds.map((r) => r.skillId));

    const alternatives = JOB_ROLES.filter((r) => r.id !== currentRoleId).map((otherRole) => {
      const otherSkillIds = otherRole.requiredSkillIds.map((r) => r.skillId);
      const sharedSkillIds = otherSkillIds.filter((sId) => baseSkillIds.has(sId));
      const deltaSkillIds = otherSkillIds.filter((sId) => !baseSkillIds.has(sId));

      const sharedSkills = SKILLS.filter((s) => sharedSkillIds.includes(s.id));
      const deltaSkills = SKILLS.filter((s) => deltaSkillIds.includes(s.id));

      const overlapPercentage = Math.round(
        (sharedSkillIds.length / Math.max(1, otherSkillIds.length)) * 100
      );

      const domain = DOMAINS.find((d) => d.id === otherRole.domainId);

      return {
        role: otherRole,
        domain,
        overlapPercentage,
        sharedSkills,
        deltaSkillsToAcquire: deltaSkills,
        effortLevel: deltaSkills.length <= 2 ? 'Low Effort Pivot' : deltaSkills.length <= 4 ? 'Moderate Effort' : 'High Transition'
      };
    });

    return {
      currentRole: baseRole,
      pivots: alternatives.sort((a, b) => b.overlapPercentage - a.overlapPercentage)
    };
  }

  // Fallback direct execution router
  public async execute(cypher: string, params: Record<string, any> = {}): Promise<any[]> {
    // Normalizes query requests and maps to in-memory graph methods
    if (cypher.includes('MATCH (u:User)') || cypher.includes('RETURN u')) {
      return USERS.map((u) => ({ user: u }));
    }
    if (cypher.includes('MATCH (s:Skill)') && cypher.includes('RETURN s')) {
      return SKILLS.map((s) => ({ skill: s }));
    }
    if (cypher.includes('MATCH (r:JobRole)') && cypher.includes('RETURN r')) {
      return JOB_ROLES.map((r) => ({ role: r }));
    }
    return [{ message: 'Executed in-memory query successfully', status: 'OK' }];
  }
}

export const inMemoryGraphEngine = new InMemoryGraphEngine();
