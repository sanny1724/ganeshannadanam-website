# CareerGraph — Technical Take-Home Interview Guide

This guide helps you confidently explain every architectural decision, query pattern, and graph database principle line-by-line during technical interviews.

---

## 1. Executive Summary (The 60-Second Pitch)

> "CareerGraph is an intelligent career trajectory engine built on **CognoDB** using the official **Neo4j JavaScript driver** and **openCypher**. Rather than flattening complex career relationships into rigid relational tables with expensive joins, CareerGraph treats skills, job requirements, courses, and hiring companies as interconnected nodes. This enables real-time 6-hop path traversals, dynamic career readiness scoring, and topological prerequisite ordering with sub-millisecond graph query performance."

---

## 2. Why a Graph Database Beats Relational RDBMS (Core Concept)

### The Relational Flaw (JOIN Pain)
In a relational database (PostgreSQL/MySQL), discovering career opportunities requires joining 8 tables:
`users` ➔ `user_skills` ➔ `skills` ➔ `role_skills` ➔ `job_roles` ➔ `domains` ➔ `adjacent_roles` ➔ `company_hiring` ➔ `companies`.

- **Complexity:** $O(N \log N)$ to $O(N^k)$ with intermediate hash tables.
- **Bottleneck:** Every JOIN creates memory pressure and requires table-level B-tree index lookups.
- **Schema Rigidity:** Adding a new relationship like `PREREQUISITE_OF` requires creating a new join table, foreign keys, and running database migrations.

### The Graph Advantage (Index-Free Adjacency)
In **CognoDB**:
- Each node stores direct memory pointers to its adjacent relationships.
- Traversing 6 hops is simply following pointer references in $O(k)$ time, where $k$ is the degree of the local subgraph.
- Pathfinding execution time is completely independent of total database size (whether 10,000 nodes or 10,000,000 nodes).

---

## 3. Key Cypher Query Walkthroughs

### 1. Topological Prerequisite DAG Order
```cypher
MATCH (role:JobRole {id: $roleId})
MATCH (sk:Skill)-[req:REQUIRED_FOR]->(role)
WHERE NOT sk.id IN $userSkillIds
OPTIONAL MATCH (prereq:Skill)-[:PREREQUISITE_OF]->(sk)
RETURN sk, collect(prereq.id) AS prereqIds
```
**Explanation:** This query extracts only the missing skills for a target role along with their direct prerequisite dependencies. The application then performs a topological sort to construct a step-by-step learning roadmap where foundational concepts precede advanced tooling.

### 2. Parameterized Cypher & Security
```typescript
const result = await session.run(
  `MATCH (u:User {id: $userId}) RETURN u`,
  { userId: req.body.userId }
);
```
**Explanation:** We never interpolate strings into Cypher queries (`${userId}`). Parameterized bindings prevent Cypher injection attacks and allow CognoDB to cache query execution plans.

---

## 4. Frontend & Visualization Architecture
- **Interactive Force-Directed Canvas:** Built with HTML5 Canvas and `d3-force` physics for 60fps rendering of 150+ interconnected nodes and relationship edges.
- **Zero-Config In-Memory Graph Fallback:** If CognoDB credentials are not provided, the backend falls back to an in-memory graph engine with identical Cypher traversal semantics, guaranteeing a zero-friction evaluation experience for interviewers.
