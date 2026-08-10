import neo4j, { Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import {
  DOMAINS,
  TECHNOLOGIES,
  SKILLS,
  JOB_ROLES,
  COMPANIES,
  PROJECTS,
  COURSES,
  CERTIFICATIONS,
  USERS
} from './seedData.js';

dotenv.config();

const uri = process.env.COGNODB_URI || 'bolt+s://demo.cognodb.io:7687';
const user = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD || '';
const database = process.env.COGNODB_DATABASE || 'neo4j';

export async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 [CognoDB Seeder] Initializing Graph Database Seed');
  console.log('====================================================');

  if (!password) {
    console.log('⚠️ [CognoDB Seeder] No COGNODB_PASSWORD provided.');
    console.log('ℹ️ In-Memory Graph Engine already preloaded with full seed dataset.');
    return;
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session: Session = driver.session({ database });

  try {
    console.log(`🔌 Connected to CognoDB at ${uri}...`);

    // 1. Clear database
    console.log('🧹 Purging previous graph nodes & relationships...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Constraints & Indexes
    console.log('🔒 Creating uniqueness constraints on ID properties...');
    const constraintQueries = [
      'CREATE CONSTRAINT domain_id_unique IF NOT EXISTS FOR (d:Domain) REQUIRE d.id IS UNIQUE',
      'CREATE CONSTRAINT tech_id_unique IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE',
      'CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
      'CREATE CONSTRAINT role_id_unique IF NOT EXISTS FOR (r:JobRole) REQUIRE r.id IS UNIQUE',
      'CREATE CONSTRAINT company_id_unique IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE',
      'CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
      'CREATE CONSTRAINT course_id_unique IF NOT EXISTS FOR (crs:Course) REQUIRE crs.id IS UNIQUE',
      'CREATE CONSTRAINT cert_id_unique IF NOT EXISTS FOR (cert:Certification) REQUIRE cert.id IS UNIQUE',
      'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE'
    ];

    for (const q of constraintQueries) {
      try {
        await session.run(q);
      } catch (err: any) {
        // Some engines may ignore IF NOT EXISTS syntax or constraints
      }
    }

    // 3. Batch Create Nodes using UNWIND parameterization
    console.log('📦 Seeding Domain nodes...');
    await session.run(
      'UNWIND $domains AS d CREATE (:Domain {id: d.id, name: d.name, description: d.description, growthRate: d.growthRate})',
      { domains: DOMAINS }
    );

    console.log('📦 Seeding Technology nodes...');
    await session.run(
      'UNWIND $techs AS t CREATE (:Technology {id: t.id, name: t.name, category: t.category, ecosystem: t.ecosystem, description: t.description})',
      { techs: TECHNOLOGIES }
    );

    console.log('📦 Seeding Skill nodes...');
    await session.run(
      'UNWIND $skills AS s CREATE (:Skill {id: s.id, name: s.name, category: s.category, difficulty: s.difficulty, demandScore: s.demandScore})',
      { skills: SKILLS }
    );

    console.log('📦 Seeding JobRole nodes...');
    await session.run(
      'UNWIND $roles AS r CREATE (:JobRole {id: r.id, title: r.title, description: r.description, demandLevel: r.demandLevel, avgSalary: r.avgSalary, experienceRequired: r.experienceRequired})',
      { roles: JOB_ROLES }
    );

    console.log('📦 Seeding Company nodes...');
    await session.run(
      'UNWIND $companies AS c CREATE (:Company {id: c.id, name: c.name, industry: c.industry, tier: c.tier, headquarters: c.headquarters})',
      { companies: COMPANIES }
    );

    console.log('📦 Seeding Project nodes...');
    await session.run(
      'UNWIND $projects AS p CREATE (:Project {id: p.id, name: p.name, difficulty: p.difficulty, description: p.description, estimatedHours: p.estimatedHours, githubUrl: p.githubUrl})',
      { projects: PROJECTS }
    );

    console.log('📦 Seeding Course nodes...');
    await session.run(
      'UNWIND $courses AS crs CREATE (:Course {id: crs.id, title: crs.title, provider: crs.provider, level: crs.level, rating: crs.rating, durationHours: crs.durationHours, url: crs.url})',
      { courses: COURSES }
    );

    console.log('📦 Seeding Certification nodes...');
    await session.run(
      'UNWIND $certs AS cert CREATE (:Certification {id: cert.id, name: cert.name, issuer: cert.issuer, validityYears: cert.validityYears, url: cert.url})',
      { certs: CERTIFICATIONS }
    );

    console.log('📦 Seeding User nodes...');
    await session.run(
      'UNWIND $users AS u CREATE (:User {id: u.id, name: u.name, experienceLevel: u.experienceLevel, targetRole: u.targetRoleId, bio: u.bio, avatar: u.avatar})',
      { users: USERS }
    );

    // 4. Batch Create Relationships
    console.log('🔗 Creating [:PART_OF] relationships (Skill -> Technology)...');
    const skillPartOfTech = SKILLS.filter((s) => s.technologyId).map((s) => ({
      skillId: s.id,
      techId: s.technologyId!
    }));
    await session.run(
      `UNWIND $items AS item
       MATCH (s:Skill {id: item.skillId}), (t:Technology {id: item.techId})
       CREATE (s)-[:PART_OF]->(t)`,
      { items: skillPartOfTech }
    );

    console.log('🔗 Creating [:PREREQUISITE_OF] relationships (Skill -> Skill)...');
    const prereqRels: { preId: string; targetId: string }[] = [];
    SKILLS.forEach((s) => {
      s.prerequisiteSkillIds?.forEach((preId) => {
        prereqRels.push({ preId, targetId: s.id });
      });
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (pre:Skill {id: item.preId}), (target:Skill {id: item.targetId})
       CREATE (pre)-[:PREREQUISITE_OF]->(target)`,
      { items: prereqRels }
    );

    console.log('🔗 Creating [:BELONGS_TO] relationships (JobRole -> Domain)...');
    const roleBelongsDomain = JOB_ROLES.map((r) => ({ roleId: r.id, domainId: r.domainId }));
    await session.run(
      `UNWIND $items AS item
       MATCH (r:JobRole {id: item.roleId}), (d:Domain {id: item.domainId})
       CREATE (r)-[:BELONGS_TO]->(d)`,
      { items: roleBelongsDomain }
    );

    console.log('🔗 Creating [:REQUIRED_FOR] relationships (Skill -> JobRole)...');
    const skillReqRole: { skillId: string; roleId: string; importance: string }[] = [];
    JOB_ROLES.forEach((r) => {
      r.requiredSkillIds.forEach((req) => {
        skillReqRole.push({ skillId: req.skillId, roleId: r.id, importance: req.importance });
      });
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (s:Skill {id: item.skillId}), (r:JobRole {id: item.roleId})
       CREATE (s)-[:REQUIRED_FOR {importance: item.importance}]->(r)`,
      { items: skillReqRole }
    );

    console.log('🔗 Creating [:USED_IN] relationships (Technology -> JobRole)...');
    const techUsedInRole: { techId: string; roleId: string }[] = [];
    JOB_ROLES.forEach((r) => {
      r.technologyIds.forEach((techId) => {
        techUsedInRole.push({ techId, roleId: r.id });
      });
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (t:Technology {id: item.techId}), (r:JobRole {id: item.roleId})
       CREATE (t)-[:USED_IN]->(r)`,
      { items: techUsedInRole }
    );

    console.log('🔗 Creating [:HIRES_FOR] relationships (Company -> JobRole)...');
    const companyHiresRole: { companyId: string; roleId: string; openPositions: number; salaryRange: string }[] = [];
    COMPANIES.forEach((c) => {
      c.hiringRoles.forEach((hr) => {
        companyHiresRole.push({ companyId: c.id, roleId: hr.roleId, openPositions: hr.openPositions, salaryRange: hr.salaryRange });
      });
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (c:Company {id: item.companyId}), (r:JobRole {id: item.roleId})
       CREATE (c)-[:HIRES_FOR {openPositions: item.openPositions, salaryRange: item.salaryRange}]->(r)`,
      { items: companyHiresRole }
    );

    console.log('🔗 Creating [:USES_SKILL] and [:RECOMMENDS_PROJECT] relationships...');
    const projUsesSkill: { projId: string; skillId: string }[] = [];
    const roleRecProj: { roleId: string; projId: string }[] = [];
    PROJECTS.forEach((p) => {
      p.skillIds.forEach((sId) => projUsesSkill.push({ projId: p.id, skillId: sId }));
      p.recommendedForRoleIds.forEach((rId) => roleRecProj.push({ roleId: rId, projId: p.id }));
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (p:Project {id: item.projId}), (s:Skill {id: item.skillId})
       CREATE (p)-[:USES_SKILL]->(s)`,
      { items: projUsesSkill }
    );
    await session.run(
      `UNWIND $items AS item
       MATCH (r:JobRole {id: item.roleId}), (p:Project {id: item.projId})
       CREATE (r)-[:RECOMMENDS_PROJECT]->(p)`,
      { items: roleRecProj }
    );

    console.log('🔗 Creating [:TEACHES] and [:VALIDATES] relationships...');
    const courseTeachesSkill: { courseId: string; skillId: string }[] = [];
    COURSES.forEach((crs) => {
      crs.teachesSkillIds.forEach((sId) => courseTeachesSkill.push({ courseId: crs.id, skillId: sId }));
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (crs:Course {id: item.courseId}), (s:Skill {id: item.skillId})
       CREATE (crs)-[:TEACHES]->(s)`,
      { items: courseTeachesSkill }
    );

    const certValidatesSkill: { certId: string; skillId: string }[] = [];
    CERTIFICATIONS.forEach((cert) => {
      cert.validatesSkillIds.forEach((sId) => certValidatesSkill.push({ certId: cert.id, skillId: sId }));
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (cert:Certification {id: item.certId}), (s:Skill {id: item.skillId})
       CREATE (cert)-[:VALIDATES]->(s)`,
      { items: certValidatesSkill }
    );

    console.log('🔗 Creating [:HAS_SKILL] and [:INTERESTED_IN] relationships (User)...');
    const userHasSkill: { userId: string; skillId: string }[] = [];
    const userInterestedDomain: { userId: string; domainId: string }[] = [];
    USERS.forEach((u) => {
      u.currentSkillIds.forEach((sId) => userHasSkill.push({ userId: u.id, skillId: sId }));
      u.interestedDomainIds.forEach((dId) => userInterestedDomain.push({ userId: u.id, domainId: dId }));
    });
    await session.run(
      `UNWIND $items AS item
       MATCH (u:User {id: item.userId}), (s:Skill {id: item.skillId})
       CREATE (u)-[:HAS_SKILL]->(s)`,
      { items: userHasSkill }
    );
    await session.run(
      `UNWIND $items AS item
       MATCH (u:User {id: item.userId}), (d:Domain {id: item.domainId})
       CREATE (u)-[:INTERESTED_IN]->(d)`,
      { items: userInterestedDomain }
    );

    // Node & Relationship Count Validation
    const nodeCountRes = await session.run('MATCH (n) RETURN count(n) AS totalNodes');
    const edgeCountRes = await session.run('MATCH ()-[r]->() RETURN count(r) AS totalRels');

    const totalNodes = nodeCountRes.records[0].get('totalNodes').toNumber();
    const totalRels = edgeCountRes.records[0].get('totalRels').toNumber();

    console.log('====================================================');
    console.log(`🎉 [CognoDB Seeder] Finished successfully!`);
    console.log(`📊 Graph Totals: ${totalNodes} Nodes | ${totalRels} Relationships`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ [CognoDB Seeder] Seeding failed:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

if (process.argv[1] && process.argv[1].includes('seeder')) {
  seedDatabase();
}
