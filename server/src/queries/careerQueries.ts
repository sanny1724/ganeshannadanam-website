/**
 * CareerGraph openCypher Query Repository
 *
 * All queries are strictly parameterized ($parameterName) to prevent Cypher injection
 * and optimize query execution plan caching in CognoDB.
 */

export const CYPHER_QUERIES = {
  /**
   * QUERY 1: Discover Job Roles Matching a User's Current Skills
   * Calculates matched skills, missing skills, and match percentage.
   * Parameter: $userSkillIds (array of string IDs)
   */
  MATCH_CAREERS_BY_SKILLS: `
    MATCH (role:JobRole)
    MATCH (role)<-[req:REQUIRED_FOR]-(sk:Skill)
    OPTIONAL MATCH (role)-[:BELONGS_TO]->(dom:Domain)
    OPTIONAL MATCH (comp:Company)-[h:HIRES_FOR]->(role)
    OPTIONAL MATCH (role)-[:RECOMMENDS_PROJECT]->(p:Project)
    OPTIONAL MATCH (tech:Technology)-[:USED_IN]->(role)
    WITH role, dom,
         collect(DISTINCT sk.id) AS allReqSkillIds,
         collect(DISTINCT {
           id: sk.id,
           name: sk.name,
           category: sk.category,
           difficulty: sk.difficulty,
           importance: req.importance,
           matched: sk.id IN $userSkillIds
         }) AS skillDetails,
         collect(DISTINCT {
           id: comp.id,
           name: comp.name,
           tier: comp.tier,
           openPositions: h.openPositions,
           salaryRange: h.salaryRange
         }) AS companies,
         collect(DISTINCT tech) AS technologies,
         count(DISTINCT p) AS projectCount
    WITH role, dom, skillDetails, companies, technologies, projectCount,
         [s IN skillDetails WHERE s.matched = true] AS matchedSkills,
         [s IN skillDetails WHERE s.matched = false] AS missingSkills,
         size(allReqSkillIds) AS totalCount
    WHERE totalCount > 0
    RETURN
      role.id AS roleId,
      role.title AS title,
      role.description AS description,
      role.demandLevel AS demandLevel,
      role.avgSalary AS avgSalary,
      role.experienceRequired AS experienceRequired,
      dom AS domain,
      toInteger(round((toFloat(size(matchedSkills)) / toFloat(totalCount)) * 100)) AS matchPercentage,
      size(matchedSkills) AS matchedSkillsCount,
      totalCount AS totalRequiredCount,
      matchedSkills,
      missingSkills,
      technologies,
      companies AS hiringCompanies,
      projectCount AS recommendedProjectsCount
    ORDER BY matchPercentage DESC, role.demandLevel ASC
  `,

  /**
   * QUERY 2: Find Missing Skills for a Target Role & Learning Order DAG
   * Discovers missing skills and traverses [:PREREQUISITE_OF] to build a topological roadmap.
   * Parameters: $roleId (string), $userSkillIds (array of string IDs)
   */
  FIND_SKILL_GAPS_FOR_ROLE: `
    MATCH (role:JobRole {id: $roleId})
    OPTIONAL MATCH (role)-[:BELONGS_TO]->(dom:Domain)
    MATCH (sk:Skill)-[req:REQUIRED_FOR]->(role)
    OPTIONAL MATCH (prereq:Skill)-[:PREREQUISITE_OF]->(sk)
    OPTIONAL MATCH (crs:Course)-[:TEACHES]->(sk)
    WITH role, dom, sk, req,
         collect(DISTINCT prereq.id) AS prereqIds,
         collect(DISTINCT crs) AS courses,
         sk.id IN $userSkillIds AS isMatched
    RETURN
      role,
      dom AS domain,
      collect({
        id: sk.id,
        name: sk.name,
        category: sk.category,
        difficulty: sk.difficulty,
        demandScore: sk.demandScore,
        importance: req.importance,
        matched: isMatched,
        prerequisiteSkillIds: prereqIds,
        courses: courses
      }) AS requiredSkills
  `,

  /**
   * QUERY 3: Find Recommended Projects for a Target Role
   * Traverses (Role)-[:RECOMMENDS_PROJECT]->(Project)-[:USES_SKILL]->(Skill)
   * Parameter: $roleId (string), $userSkillIds (array of string IDs)
   */
  FIND_RECOMMENDED_PROJECTS: `
    MATCH (role:JobRole {id: $roleId})-[:RECOMMENDS_PROJECT]->(p:Project)
    OPTIONAL MATCH (p)-[:USES_SKILL]->(s:Skill)
    OPTIONAL MATCH (p)-[:USES_TECHNOLOGY]->(t:Technology)
    WITH p, collect(DISTINCT s) AS usedSkills, collect(DISTINCT t) AS usedTechs
    RETURN
      p.id AS id,
      p.name AS name,
      p.difficulty AS difficulty,
      p.description AS description,
      p.estimatedHours AS estimatedHours,
      p.githubUrl AS githubUrl,
      usedSkills,
      [s IN usedSkills WHERE NOT (s.id IN $userSkillIds)] AS gapSkillsUnlocked,
      usedTechs AS technologies
    ORDER BY p.difficulty ASC
  `,

  /**
   * QUERY 4: Find Courses and Certifications for Skills
   * Traverses (Course)-[:TEACHES]->(Skill) and (Certification)-[:VALIDATES]->(Skill)
   * Parameter: $skillIds (array of string IDs)
   */
  FIND_COURSES_AND_CERTS: `
    MATCH (s:Skill)
    WHERE s.id IN $skillIds
    OPTIONAL MATCH (crs:Course)-[:TEACHES]->(s)
    OPTIONAL MATCH (cert:Certification)-[:VALIDATES]->(s)
    WITH s, collect(DISTINCT crs) AS courses, collect(DISTINCT cert) AS certifications
    RETURN
      s.id AS skillId,
      s.name AS skillName,
      courses,
      certifications
  `,

  /**
   * QUERY 5: Multi-Hop Traversal (2+ Hops)
   * User -> HAS_SKILL -> Skill -> REQUIRED_FOR -> JobRole -> HIRES_FOR -> Company
   * Parameter: $userSkillIds (array of string IDs)
   */
  MULTI_HOP_SKILL_TO_COMPANIES: `
    MATCH (s:Skill)
    WHERE s.id IN $userSkillIds
    MATCH (s)-[:REQUIRED_FOR]->(r:JobRole)<-[h:HIRES_FOR]-(c:Company)
    OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Domain)
    RETURN
      s.name AS connectingSkill,
      r.title AS matchedRole,
      d.name AS domain,
      c.name AS companyName,
      c.tier AS companyTier,
      h.salaryRange AS salaryRange,
      h.openPositions AS openPositions
    ORDER BY c.name ASC
  `,

  /**
   * QUERY 6: Deep Multi-Hop Variable Traversal (3 to 5 Hops)
   * Explores pathways: (StartSkill)-[:PREREQUISITE_OF*0..2]->(IntermediateSkill)-[:REQUIRED_FOR]->(JobRole)-[:BELONGS_TO]->(Domain)
   * Parameter: $startSkillId (string)
   */
  DEEP_CAREER_PATH_TRAVERSAL: `
    MATCH (startSkill:Skill {id: $startSkillId})
    OPTIONAL MATCH (startSkill)-[:PREREQUISITE_OF*0..2]->(targetSkill:Skill)-[:REQUIRED_FOR]->(r:JobRole)
    OPTIONAL MATCH (r)-[:BELONGS_TO]->(d:Domain)
    OPTIONAL MATCH (c:Company)-[h:HIRES_FOR]->(r)
    WITH startSkill, targetSkill, r, d, collect(DISTINCT { company: c.name, salary: h.salaryRange }) AS hiring
    WHERE r IS NOT NULL
    RETURN
      startSkill.name AS initialSkill,
      targetSkill.name AS connectingSkill,
      r.title AS careerRole,
      r.demandLevel AS demandLevel,
      r.avgSalary AS avgSalary,
      d.name AS domain,
      hiring AS companiesHiring
    ORDER BY r.demandLevel ASC
  `,

  /**
   * QUERY 7: Full Graph Neighborhood Subgraph Extraction
   * Extracts local subgraphs for dynamic force-directed Canvas visualization.
   * Parameter: $nodeId (string, optional), $label (string, optional), $limit (integer)
   */
  EXTRACT_GRAPH_SUBGRAPH: `
    MATCH (n)
    WHERE ($label = 'All' OR labels(n)[0] = $label)
    WITH n LIMIT $limit
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE ($label = 'All' OR labels(m)[0] = $label)
    RETURN
      collect(DISTINCT {
        id: n.id,
        label: labels(n)[0],
        name: coalesce(n.name, n.title),
        properties: properties(n)
      }) AS nodes,
      collect(DISTINCT {
        id: id(r),
        source: startNode(r).id,
        target: endNode(r).id,
        type: type(r),
        properties: properties(r)
      }) AS relationships
  `,

  /**
   * QUERY 8: Alternative Career Paths / Lateral Pivots
   * Identifies roles that share high Jaccard skill similarity with the target role.
   * Parameter: $roleId (string)
   */
  FIND_ALTERNATIVE_PIVOT_ROLES: `
    MATCH (baseRole:JobRole {id: $roleId})<-[:REQUIRED_FOR]-(baseSkill:Skill)
    WITH baseRole, collect(baseSkill) AS baseSkills
    MATCH (otherRole:JobRole)<-[:REQUIRED_FOR]-(otherSkill:Skill)
    WHERE otherRole.id <> baseRole.id
    WITH baseRole, baseSkills, otherRole, collect(otherSkill) AS otherSkills
    WITH baseRole, otherRole,
         [s IN otherSkills WHERE s IN baseSkills] AS sharedSkills,
         [s IN otherSkills WHERE NOT s IN baseSkills] AS deltaSkills,
         otherSkills
    RETURN
      otherRole.id AS roleId,
      otherRole.title AS roleTitle,
      otherRole.demandLevel AS demandLevel,
      otherRole.avgSalary AS avgSalary,
      size(sharedSkills) AS sharedSkillCount,
      size(deltaSkills) AS missingSkillCount,
      toInteger(round((toFloat(size(sharedSkills)) / toFloat(size(otherSkills))) * 100)) AS overlapPercentage,
      sharedSkills,
      deltaSkills
    ORDER BY overlapPercentage DESC
  `,

  /**
   * CRITICAL QUERY: 6-Hop Graph Traversal vs 7-Table Relational JOIN
   * Traversal: (User)->[:HAS_SKILL]->(Skill)->[:REQUIRED_FOR]->(Role)->[:BELONGS_TO]->(Domain)<-[:BELONGS_TO]-(Role2)<-[:HIRES_FOR]-(Company)
   * Discovers adjacent high-paying companies in related domain roles.
   */
  RELATIONAL_COMPARISON_QUERY: `
    MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(r1:JobRole)-[:BELONGS_TO]->(d:Domain)
    MATCH (d)<-[:BELONGS_TO]-(r2:JobRole)<-[h:HIRES_FOR]-(c:Company)
    WHERE r1 <> r2
    RETURN
      u.name AS studentName,
      s.name AS foundationSkill,
      r1.title AS primaryRole,
      d.name AS techDomain,
      r2.title AS adjacentOpportunityRole,
      c.name AS hiringCompany,
      h.salaryRange AS salaryRange,
      h.openPositions AS positions
    ORDER BY c.name ASC LIMIT 20
  `
};
