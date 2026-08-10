import {
  UserProfile,
  Skill,
  JobRole,
  Domain,
  Technology,
  Project,
  Course,
  Certification
} from '../types/graph';

export const FALLBACK_USERS: UserProfile[] = [
  {
    id: "usr-alex",
    name: "Alex Chen",
    experienceLevel: "Student",
    targetRoleId: "role-ml-eng",
    bio: "CS Senior specializing in algorithms and Python backend seeking transition into ML Engineering & LLMs.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    currentSkillIds: ["sk-python", "sk-sql", "sk-algorithms", "sk-ml-basics", "sk-git"],
    interestedDomainIds: ["dom-ai", "dom-cloud"]
  },
  {
    id: "usr-priya",
    name: "Priya Sharma",
    experienceLevel: "Entry-Level",
    targetRoleId: "role-ai-app-eng",
    bio: "Junior developer with solid JavaScript/React foundations eager to build RAG-powered GenAI software.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    currentSkillIds: ["sk-javascript", "sk-typescript", "sk-react", "sk-tailwind", "sk-python", "sk-git"],
    interestedDomainIds: ["dom-ai", "dom-web"]
  },
  {
    id: "usr-marcus",
    name: "Marcus Vance",
    experienceLevel: "Mid-Level",
    targetRoleId: "role-dist-sys-eng",
    bio: "Backend developer with 2 years Node.js & SQL experience leveling up in Go and distributed consensus systems.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    currentSkillIds: ["sk-javascript", "sk-nodejs", "sk-rest-api", "sk-sql", "sk-postgres", "sk-docker", "sk-git"],
    interestedDomainIds: ["dom-cloud", "dom-fintech"]
  },
  {
    id: "usr-sophia",
    name: "Sophia Rodriguez",
    experienceLevel: "Entry-Level",
    targetRoleId: "role-devops-eng",
    bio: "Systems enthusiast learning Linux, container orchestration, and Infrastructure as Code.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    currentSkillIds: ["sk-linux", "sk-docker", "sk-git", "sk-python", "sk-ci-cd"],
    interestedDomainIds: ["dom-devops", "dom-cloud", "dom-sre"]
  },
  {
    id: "usr-david",
    name: "David Kim",
    experienceLevel: "Student",
    targetRoleId: "role-fullstack-eng",
    bio: "Full-stack bootcamp graduate building modern web apps with TypeScript and React.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    currentSkillIds: ["sk-javascript", "sk-typescript", "sk-react", "sk-tailwind", "sk-nodejs", "sk-sql"],
    interestedDomainIds: ["dom-web", "dom-cloud"]
  }
];

export const FALLBACK_DOMAINS: Domain[] = [
  { id: "dom-ai", name: "Artificial Intelligence & ML", description: "Deep learning, LLMs, neural networks, and generative AI systems", growthRate: "+38% YoY" },
  { id: "dom-cloud", name: "Cloud & Distributed Systems", description: "Scalable microservices, multi-region cloud infrastructure, and distributed computing", growthRate: "+26% YoY" },
  { id: "dom-web", name: "Modern Web Engineering", description: "High-performance full-stack applications, real-time web platforms, and UI architectures", growthRate: "+18% YoY" },
  { id: "dom-data", name: "Data Engineering & Analytics", description: "Large-scale ETL pipelines, data warehouses, streaming analytics, and business intelligence", growthRate: "+24% YoY" },
  { id: "dom-devops", name: "DevOps & Platform Engineering", description: "CI/CD automation, Kubernetes orchestration, Infrastructure as Code, and observability", growthRate: "+29% YoY" },
  { id: "dom-security", name: "Cybersecurity & DevSecOps", description: "Zero trust security, threat modeling, cloud identity, and application security audits", growthRate: "+32% YoY" }
];

export const FALLBACK_TECHNOLOGIES: Technology[] = [
  { id: "tech-python", name: "Python", category: "Language", ecosystem: "AI/Data/Backend", description: "The premier language for machine learning, data science, and backend scripting" },
  { id: "tech-ts", name: "TypeScript", category: "Language", ecosystem: "Web/Node", description: "Type-safe JavaScript superset powering modern enterprise web applications" },
  { id: "tech-react", name: "React ecosystem", category: "Frontend", ecosystem: "Web", description: "Component-driven declarative UI library for modern web experiences" },
  { id: "tech-nodejs", name: "Node.js & Express", category: "Backend Runtime", ecosystem: "Web", description: "Event-driven asynchronous JavaScript runtime for scalable network services" },
  { id: "tech-pytorch", name: "PyTorch", category: "AI Framework", ecosystem: "AI/ML", description: "Dynamic tensor computing and deep neural network framework" },
  { id: "tech-docker", name: "Docker", category: "Containerization", ecosystem: "DevOps", description: "Standard container runtime for packaging applications with dependencies" },
  { id: "tech-neo4j", name: "CognoDB / Neo4j", category: "Graph Database", ecosystem: "Graph", description: "Native graph database designed for connected data relationships and openCypher" }
];

export const FALLBACK_SKILLS: Skill[] = [
  { id: "sk-python", name: "Python Programming", category: "Programming", difficulty: "Beginner", demandScore: 98 },
  { id: "sk-typescript", name: "TypeScript", category: "Programming", difficulty: "Intermediate", demandScore: 95 },
  { id: "sk-javascript", name: "JavaScript (ES6+)", category: "Programming", difficulty: "Beginner", demandScore: 92 },
  { id: "sk-sql", name: "SQL & Query Optimization", category: "Database", difficulty: "Beginner", demandScore: 94 },
  { id: "sk-algorithms", name: "Data Structures & Algorithms", category: "Architecture", difficulty: "Intermediate", demandScore: 96 },
  { id: "sk-react", name: "React.js", category: "Framework", difficulty: "Beginner", demandScore: 94, prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-nextjs", name: "Next.js & Server Components", category: "Framework", difficulty: "Intermediate", demandScore: 91, prerequisiteSkillIds: ["sk-react", "sk-typescript"] },
  { id: "sk-tailwind", name: "Tailwind CSS & Responsive UI", category: "Framework", difficulty: "Beginner", demandScore: 87, prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-nodejs", name: "Node.js Backend Development", category: "Framework", difficulty: "Intermediate", demandScore: 93, prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-rest-api", name: "REST API Design & Security", category: "Architecture", difficulty: "Beginner", demandScore: 92 },
  { id: "sk-postgres", name: "PostgreSQL Administration & Indexing", category: "Database", difficulty: "Intermediate", demandScore: 90, prerequisiteSkillIds: ["sk-sql"] },
  { id: "sk-graph-db", name: "Graph Databases & Cypher Queries", category: "Database", difficulty: "Intermediate", demandScore: 92 },
  { id: "sk-ml-basics", name: "Machine Learning Fundamentals", category: "AI/ML", difficulty: "Beginner", demandScore: 92, prerequisiteSkillIds: ["sk-python"] },
  { id: "sk-deep-learning", name: "Deep Learning & Neural Networks", category: "AI/ML", difficulty: "Intermediate", demandScore: 94, prerequisiteSkillIds: ["sk-ml-basics"] },
  { id: "sk-pytorch", name: "PyTorch Tensor Operations & Training", category: "AI/ML", difficulty: "Intermediate", demandScore: 95, prerequisiteSkillIds: ["sk-deep-learning"] },
  { id: "sk-llm-rag", name: "RAG & LLM Application Engineering", category: "AI/ML", difficulty: "Intermediate", demandScore: 99, prerequisiteSkillIds: ["sk-python", "sk-ml-basics"] },
  { id: "sk-docker", name: "Docker Containerization", category: "DevOps", difficulty: "Beginner", demandScore: 95 },
  { id: "sk-k8s", name: "Kubernetes Orchestration", category: "DevOps", difficulty: "Advanced", demandScore: 96, prerequisiteSkillIds: ["sk-docker"] },
  { id: "sk-git", name: "Git & Collaborative Workflows", category: "Architecture", difficulty: "Beginner", demandScore: 95 },
  { id: "sk-linux", name: "Linux System Administration", category: "DevOps", difficulty: "Beginner", demandScore: 89 },
  { id: "sk-ci-cd", name: "CI/CD Automation Pipelines", category: "DevOps", difficulty: "Intermediate", demandScore: 91, prerequisiteSkillIds: ["sk-docker"] }
];

export const FALLBACK_JOB_ROLES: JobRole[] = [
  {
    id: "role-ml-eng",
    title: "Machine Learning Engineer",
    description: "Design, train, optimize, and deploy production ML models, deep neural networks, and inference engines at scale.",
    demandLevel: "Very High",
    avgSalary: "$165,000 - $225,000",
    experienceRequired: "1-3 Years",
    domainId: "dom-ai",
    requiredSkillIds: [
      { skillId: "sk-python", importance: "Must-Have" },
      { skillId: "sk-ml-basics", importance: "Must-Have" },
      { skillId: "sk-deep-learning", importance: "Must-Have" },
      { skillId: "sk-pytorch", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" },
      { skillId: "sk-sql", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-pytorch", "tech-docker"]
  },
  {
    id: "role-ai-app-eng",
    title: "AI / LLM Application Engineer",
    description: "Build generative AI applications, intelligent agents, RAG pipelines, and vector database embeddings for enterprise software.",
    demandLevel: "Very High",
    avgSalary: "$150,000 - $210,000",
    experienceRequired: "0-2 Years",
    domainId: "dom-ai",
    requiredSkillIds: [
      { skillId: "sk-python", importance: "Must-Have" },
      { skillId: "sk-llm-rag", importance: "Must-Have" },
      { skillId: "sk-typescript", importance: "Must-Have" },
      { skillId: "sk-graph-db", importance: "Good-to-Have" },
      { skillId: "sk-react", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-ts", "tech-neo4j"]
  },
  {
    id: "role-backend-eng",
    title: "Backend Software Engineer",
    description: "Architect high-throughput REST/GraphQL APIs, microservices, database schemas, and distributed asynchronous event queues.",
    demandLevel: "Very High",
    avgSalary: "$135,000 - $185,000",
    experienceRequired: "1-3 Years",
    domainId: "dom-cloud",
    requiredSkillIds: [
      { skillId: "sk-nodejs", importance: "Must-Have" },
      { skillId: "sk-typescript", importance: "Must-Have" },
      { skillId: "sk-rest-api", importance: "Must-Have" },
      { skillId: "sk-sql", importance: "Must-Have" },
      { skillId: "sk-postgres", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-nodejs", "tech-ts", "tech-docker"]
  },
  {
    id: "role-frontend-eng",
    title: "Frontend Engineer",
    description: "Craft responsive, accessible, pixel-perfect user interfaces, state management architectures, and optimized client web apps.",
    demandLevel: "High",
    avgSalary: "$125,000 - $175,000",
    experienceRequired: "0-2 Years",
    domainId: "dom-web",
    requiredSkillIds: [
      { skillId: "sk-javascript", importance: "Must-Have" },
      { skillId: "sk-typescript", importance: "Must-Have" },
      { skillId: "sk-react", importance: "Must-Have" },
      { skillId: "sk-tailwind", importance: "Must-Have" },
      { skillId: "sk-nextjs", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-react", "tech-ts"]
  },
  {
    id: "role-fullstack-eng",
    title: "Full-Stack Engineer",
    description: "End-to-end web product engineering from intuitive UI design to database migrations, business logic, and deployment.",
    demandLevel: "Very High",
    avgSalary: "$140,000 - $195,000",
    experienceRequired: "1-3 Years",
    domainId: "dom-web",
    requiredSkillIds: [
      { skillId: "sk-typescript", importance: "Must-Have" },
      { skillId: "sk-react", importance: "Must-Have" },
      { skillId: "sk-nextjs", importance: "Must-Have" },
      { skillId: "sk-nodejs", importance: "Must-Have" },
      { skillId: "sk-postgres", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-react", "tech-ts", "tech-nodejs"]
  },
  {
    id: "role-devops-eng",
    title: "DevOps / Cloud Engineer",
    description: "Automate build and release pipelines, manage multi-region cloud infrastructures, and maintain high-uptime Kubernetes clusters.",
    demandLevel: "Very High",
    avgSalary: "$145,000 - $205,000",
    experienceRequired: "2-4 Years",
    domainId: "dom-devops",
    requiredSkillIds: [
      { skillId: "sk-linux", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Must-Have" },
      { skillId: "sk-k8s", importance: "Must-Have" },
      { skillId: "sk-ci-cd", importance: "Must-Have" }
    ],
    technologyIds: ["tech-docker"]
  }
];
