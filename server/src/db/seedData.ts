export interface UserNode {
  id: string;
  name: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Student';
  targetRoleId: string;
  bio: string;
  avatar: string;
  currentSkillIds: string[];
  interestedDomainIds: string[];
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'Programming' | 'Framework' | 'Database' | 'DevOps' | 'AI/ML' | 'Architecture' | 'Security';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  demandScore: number; // 1-100
  technologyId?: string;
  prerequisiteSkillIds?: string[];
}

export interface TechnologyNode {
  id: string;
  name: string;
  category: string;
  ecosystem: string;
  description: string;
}

export interface JobRoleNode {
  id: string;
  title: string;
  description: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  avgSalary: string;
  experienceRequired: string;
  domainId: string;
  requiredSkillIds: { skillId: string; importance: 'Must-Have' | 'Good-to-Have' }[];
  technologyIds: string[];
}

export interface CompanyNode {
  id: string;
  name: string;
  industry: string;
  tier: 'FAANG/Tech Giant' | 'High-Growth Unicorn' | 'Enterprise' | 'AI Startup';
  headquarters: string;
  hiringRoles: { roleId: string; openPositions: number; salaryRange: string }[];
}

export interface ProjectNode {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  estimatedHours: number;
  githubUrl: string;
  skillIds: string[];
  technologyIds: string[];
  recommendedForRoleIds: string[];
}

export interface CourseNode {
  id: string;
  title: string;
  provider: 'Coursera' | 'DeepLearning.AI' | 'Frontend Masters' | 'MIT OCW' | 'Stanford Online' | 'edX' | 'Udemy';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  durationHours: number;
  url: string;
  teachesSkillIds: string[];
}

export interface CertificationNode {
  id: string;
  name: string;
  issuer: string;
  validityYears: number;
  url: string;
  validatesSkillIds: string[];
}

export interface DomainNode {
  id: string;
  name: string;
  description: string;
  growthRate: string;
}

export const DOMAINS: DomainNode[] = [
  { id: "dom-ai", name: "Artificial Intelligence & ML", description: "Deep learning, LLMs, neural networks, and generative AI systems", growthRate: "+38% YoY" },
  { id: "dom-cloud", name: "Cloud & Distributed Systems", description: "Scalable microservices, multi-region cloud infrastructure, and distributed computing", growthRate: "+26% YoY" },
  { id: "dom-web", name: "Modern Web Engineering", description: "High-performance full-stack applications, real-time web platforms, and UI architectures", growthRate: "+18% YoY" },
  { id: "dom-data", name: "Data Engineering & Analytics", description: "Large-scale ETL pipelines, data warehouses, streaming analytics, and business intelligence", growthRate: "+24% YoY" },
  { id: "dom-devops", name: "DevOps & Platform Engineering", description: "CI/CD automation, Kubernetes orchestration, Infrastructure as Code, and observability", growthRate: "+29% YoY" },
  { id: "dom-security", name: "Cybersecurity & DevSecOps", description: "Zero trust security, threat modeling, cloud identity, and application security audits", growthRate: "+32% YoY" },
  { id: "dom-mobile", name: "Mobile App Architecture", description: "Cross-platform and native mobile software engineering for millions of devices", growthRate: "+15% YoY" },
  { id: "dom-fintech", name: "FinTech & Transaction Systems", description: "High-throughput financial ledgers, payment gateways, and regulatory compliance", growthRate: "+22% YoY" },
  { id: "dom-sre", name: "Site Reliability & Performance", description: "SLO management, chaos engineering, high availability architectures, and latency optimization", growthRate: "+27% YoY" }
];

export const TECHNOLOGIES: TechnologyNode[] = [
  { id: "tech-python", name: "Python", category: "Language", ecosystem: "AI/Data/Backend", description: "The premier language for machine learning, data science, and backend scripting" },
  { id: "tech-ts", name: "TypeScript", category: "Language", ecosystem: "Web/Node", description: "Type-safe JavaScript superset powering modern enterprise web applications" },
  { id: "tech-java", name: "Java / JVM", category: "Language", ecosystem: "Enterprise Backend", description: "Enterprise-grade robust backend and distributed systems language" },
  { id: "tech-go", name: "Go (Golang)", category: "Language", ecosystem: "Cloud/Systems", description: "High-concurrency language powering modern cloud-native tools like Docker & K8s" },
  { id: "tech-react", name: "React ecosystem", category: "Frontend", ecosystem: "Web", description: "Component-driven declarative UI library for modern web experiences" },
  { id: "tech-nextjs", name: "Next.js", category: "Full-Stack", ecosystem: "Web", description: "Production React framework with SSR, static generation, and edge API routes" },
  { id: "tech-nodejs", name: "Node.js & Express", category: "Backend Runtime", ecosystem: "Web", description: "Event-driven asynchronous JavaScript runtime for scalable network services" },
  { id: "tech-pytorch", name: "PyTorch", category: "AI Framework", ecosystem: "AI/ML", description: "Dynamic tensor computing and deep neural network framework" },
  { id: "tech-langchain", name: "LangChain / LlamaIndex", category: "AI Framework", ecosystem: "Generative AI", description: "Frameworks for building context-aware reasoning applications and RAG pipelines" },
  { id: "tech-docker", name: "Docker", category: "Containerization", ecosystem: "DevOps", description: "Standard container runtime for packaging applications with dependencies" },
  { id: "tech-k8s", name: "Kubernetes", category: "Orchestration", ecosystem: "Cloud Native", description: "Automated container deployment, scaling, and cluster management" },
  { id: "tech-aws", name: "Amazon Web Services (AWS)", category: "Cloud Platform", ecosystem: "Cloud", description: "Comprehensive cloud platform offering compute, storage, and serverless" },
  { id: "tech-postgres", name: "PostgreSQL", category: "Relational DB", ecosystem: "Data", description: "Advanced open-source relational database with powerful JSON & extension support" },
  { id: "tech-redis", name: "Redis", category: "In-Memory Cache", ecosystem: "Data", description: "Ultra-fast in-memory key-value data structure store and pub/sub broker" },
  { id: "tech-kafka", name: "Apache Kafka", category: "Event Streaming", ecosystem: "Distributed Systems", description: "High-throughput distributed event streaming platform for real-time data pipelines" },
  { id: "tech-graphql", name: "GraphQL", category: "API Paradigm", ecosystem: "Web/API", description: "Declarative query language for APIs and runtime for fulfilling queries" },
  { id: "tech-terraform", name: "Terraform", category: "IaC", ecosystem: "DevOps", description: "Declarative Infrastructure as Code tool for multi-cloud provisioning" },
  { id: "tech-fastapi", name: "FastAPI", category: "Backend Framework", ecosystem: "Python", description: "Modern, fast (high-performance) web framework for building APIs with Python" },
  { id: "tech-snowflake", name: "Snowflake", category: "Data Warehouse", ecosystem: "Data", description: "Cloud data warehouse and analytical engine for large-scale queries" },
  { id: "tech-neo4j", name: "CognoDB / Neo4j", category: "Graph Database", ecosystem: "Graph", description: "Native graph database designed for connected data relationships and openCypher" }
];

export const SKILLS: SkillNode[] = [
  // Programming & Core
  { id: "sk-python", name: "Python Programming", category: "Programming", difficulty: "Beginner", demandScore: 98, technologyId: "tech-python" },
  { id: "sk-typescript", name: "TypeScript", category: "Programming", difficulty: "Intermediate", demandScore: 95, technologyId: "tech-ts" },
  { id: "sk-javascript", name: "JavaScript (ES6+)", category: "Programming", difficulty: "Beginner", demandScore: 92, technologyId: "tech-ts" },
  { id: "sk-java", name: "Java Programming", category: "Programming", difficulty: "Beginner", demandScore: 88, technologyId: "tech-java" },
  { id: "sk-golang", name: "Go Programming", category: "Programming", difficulty: "Intermediate", demandScore: 90, technologyId: "tech-go" },
  { id: "sk-sql", name: "SQL & Query Optimization", category: "Database", difficulty: "Beginner", demandScore: 94, technologyId: "tech-postgres" },
  { id: "sk-algorithms", name: "Data Structures & Algorithms", category: "Architecture", difficulty: "Intermediate", demandScore: 96 },
  
  // Web & Frontend
  { id: "sk-react", name: "React.js", category: "Framework", difficulty: "Beginner", demandScore: 94, technologyId: "tech-react", prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-nextjs", name: "Next.js & Server Components", category: "Framework", difficulty: "Intermediate", demandScore: 91, technologyId: "tech-nextjs", prerequisiteSkillIds: ["sk-react", "sk-typescript"] },
  { id: "sk-state-mgmt", name: "State Management (Redux/Zustand)", category: "Framework", difficulty: "Intermediate", demandScore: 82, technologyId: "tech-react", prerequisiteSkillIds: ["sk-react"] },
  { id: "sk-tailwind", name: "Tailwind CSS & Responsive UI", category: "Framework", difficulty: "Beginner", demandScore: 87, prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-web-perf", name: "Web Performance & Core Vitals", category: "Architecture", difficulty: "Advanced", demandScore: 85, prerequisiteSkillIds: ["sk-react", "sk-typescript"] },

  // Backend & APIs
  { id: "sk-nodejs", name: "Node.js Backend Development", category: "Framework", difficulty: "Intermediate", demandScore: 93, technologyId: "tech-nodejs", prerequisiteSkillIds: ["sk-javascript"] },
  { id: "sk-rest-api", name: "REST API Design & Security", category: "Architecture", difficulty: "Beginner", demandScore: 92 },
  { id: "sk-express", name: "Express.js Framework", category: "Framework", difficulty: "Beginner", demandScore: 86, technologyId: "tech-nodejs", prerequisiteSkillIds: ["sk-nodejs", "sk-rest-api"] },
  { id: "sk-fastapi", name: "FastAPI Async Services", category: "Framework", difficulty: "Intermediate", demandScore: 89, technologyId: "tech-fastapi", prerequisiteSkillIds: ["sk-python", "sk-rest-api"] },
  { id: "sk-graphql", name: "GraphQL Schema & Resolvers", category: "Architecture", difficulty: "Intermediate", demandScore: 84, technologyId: "tech-graphql", prerequisiteSkillIds: ["sk-rest-api"] },
  { id: "sk-microservices", name: "Microservices Architecture", category: "Architecture", difficulty: "Advanced", demandScore: 91, prerequisiteSkillIds: ["sk-rest-api", "sk-docker"] },
  { id: "sk-system-design", name: "Distributed System Design", category: "Architecture", difficulty: "Advanced", demandScore: 97, prerequisiteSkillIds: ["sk-algorithms", "sk-sql"] },

  // Databases & Storage
  { id: "sk-postgres", name: "PostgreSQL Administration & Indexing", category: "Database", difficulty: "Intermediate", demandScore: 90, technologyId: "tech-postgres", prerequisiteSkillIds: ["sk-sql"] },
  { id: "sk-redis", name: "Redis Caching & PubSub", category: "Database", difficulty: "Intermediate", demandScore: 88, technologyId: "tech-redis" },
  { id: "sk-graph-db", name: "Graph Databases & Cypher Queries", category: "Database", difficulty: "Intermediate", demandScore: 92, technologyId: "tech-neo4j" },
  { id: "sk-kafka", name: "Event-Driven Architecture (Kafka)", category: "Architecture", difficulty: "Advanced", demandScore: 93, technologyId: "tech-kafka", prerequisiteSkillIds: ["sk-system-design"] },

  // AI / ML / LLMs
  { id: "sk-ml-basics", name: "Machine Learning Fundamentals", category: "AI/ML", difficulty: "Beginner", demandScore: 92, prerequisiteSkillIds: ["sk-python"] },
  { id: "sk-deep-learning", name: "Deep Learning & Neural Networks", category: "AI/ML", difficulty: "Intermediate", demandScore: 94, prerequisiteSkillIds: ["sk-ml-basics"] },
  { id: "sk-pytorch", name: "PyTorch Tensor Operations & Training", category: "AI/ML", difficulty: "Intermediate", demandScore: 95, technologyId: "tech-pytorch", prerequisiteSkillIds: ["sk-deep-learning"] },
  { id: "sk-llm-rag", name: "RAG & LLM Application Engineering", category: "AI/ML", difficulty: "Intermediate", demandScore: 99, technologyId: "tech-langchain", prerequisiteSkillIds: ["sk-python", "sk-ml-basics"] },
  { id: "sk-mlops", name: "MLOps & Model Deployment", category: "AI/ML", difficulty: "Advanced", demandScore: 93, prerequisiteSkillIds: ["sk-pytorch", "sk-docker"] },
  { id: "sk-transformers", name: "Transformer Architectures & Fine-Tuning", category: "AI/ML", difficulty: "Advanced", demandScore: 96, prerequisiteSkillIds: ["sk-pytorch"] },
  { id: "sk-nlp", name: "Natural Language Processing (NLP)", category: "AI/ML", difficulty: "Intermediate", demandScore: 89, prerequisiteSkillIds: ["sk-ml-basics"] },
  { id: "sk-computer-vision", name: "Computer Vision & OpenCV", category: "AI/ML", difficulty: "Intermediate", demandScore: 85, prerequisiteSkillIds: ["sk-deep-learning"] },

  // DevOps & Cloud
  { id: "sk-docker", name: "Docker Containerization", category: "DevOps", difficulty: "Beginner", demandScore: 95, technologyId: "tech-docker" },
  { id: "sk-k8s", name: "Kubernetes Orchestration", category: "DevOps", difficulty: "Advanced", demandScore: 96, technologyId: "tech-k8s", prerequisiteSkillIds: ["sk-docker"] },
  { id: "sk-ci-cd", name: "CI/CD Automation Pipelines", category: "DevOps", difficulty: "Intermediate", demandScore: 91, prerequisiteSkillIds: ["sk-docker"] },
  { id: "sk-aws-cloud", name: "AWS Cloud Infrastructure", category: "DevOps", difficulty: "Intermediate", demandScore: 94, technologyId: "tech-aws" },
  { id: "sk-terraform", name: "Infrastructure as Code (Terraform)", category: "DevOps", difficulty: "Intermediate", demandScore: 90, technologyId: "tech-terraform", prerequisiteSkillIds: ["sk-aws-cloud"] },
  { id: "sk-observability", name: "Observability & Metrics (Prometheus/Grafana)", category: "DevOps", difficulty: "Intermediate", demandScore: 87, prerequisiteSkillIds: ["sk-docker"] },
  { id: "sk-linux", name: "Linux System Administration & Shell", category: "DevOps", difficulty: "Beginner", demandScore: 89 },

  // Data Engineering
  { id: "sk-spark", name: "Apache Spark & Big Data Processing", category: "Database", difficulty: "Advanced", demandScore: 88, prerequisiteSkillIds: ["sk-python", "sk-sql"] },
  { id: "sk-etl", name: "Data Pipeline & ETL Engineering", category: "Database", difficulty: "Intermediate", demandScore: 90, prerequisiteSkillIds: ["sk-sql", "sk-python"] },
  { id: "sk-snowflake", name: "Data Warehousing (Snowflake)", category: "Database", difficulty: "Intermediate", demandScore: 86, technologyId: "tech-snowflake", prerequisiteSkillIds: ["sk-sql"] },

  // Security & Best Practices
  { id: "sk-appsec", name: "Application Security & OWASP Top 10", category: "Security", difficulty: "Intermediate", demandScore: 88, prerequisiteSkillIds: ["sk-rest-api"] },
  { id: "sk-iam", name: "Cloud IAM & Zero Trust", category: "Security", difficulty: "Intermediate", demandScore: 87, prerequisiteSkillIds: ["sk-aws-cloud"] },
  { id: "sk-git", name: "Git & Collaborative Workflows", category: "Architecture", difficulty: "Beginner", demandScore: 95 }
];

export const JOB_ROLES: JobRoleNode[] = [
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
      { skillId: "sk-mlops", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" },
      { skillId: "sk-sql", importance: "Good-to-Have" },
      { skillId: "sk-fastapi", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-pytorch", "tech-docker", "tech-fastapi"]
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
      { skillId: "sk-fastapi", importance: "Must-Have" },
      { skillId: "sk-graph-db", importance: "Good-to-Have" },
      { skillId: "sk-react", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-langchain", "tech-ts", "tech-neo4j", "tech-fastapi"]
  },
  {
    id: "role-data-scientist",
    title: "Data Scientist",
    description: "Extract actionable insights, statistical patterns, and predictive models from massive unstructured and structured datasets.",
    demandLevel: "High",
    avgSalary: "$140,000 - $190,000",
    experienceRequired: "1-3 Years",
    domainId: "dom-data",
    requiredSkillIds: [
      { skillId: "sk-python", importance: "Must-Have" },
      { skillId: "sk-sql", importance: "Must-Have" },
      { skillId: "sk-ml-basics", importance: "Must-Have" },
      { skillId: "sk-deep-learning", importance: "Good-to-Have" },
      { skillId: "sk-nlp", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-postgres", "tech-snowflake"]
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
      { skillId: "sk-redis", importance: "Good-to-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" },
      { skillId: "sk-system-design", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-nodejs", "tech-ts", "tech-postgres", "tech-redis", "tech-docker"]
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
      { skillId: "sk-nextjs", importance: "Good-to-Have" },
      { skillId: "sk-web-perf", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-react", "tech-ts", "tech-nextjs"]
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
      { skillId: "sk-docker", importance: "Good-to-Have" },
      { skillId: "sk-graphql", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-react", "tech-nextjs", "tech-nodejs", "tech-ts", "tech-postgres"]
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
      { skillId: "sk-ci-cd", importance: "Must-Have" },
      { skillId: "sk-aws-cloud", importance: "Must-Have" },
      { skillId: "sk-terraform", importance: "Good-to-Have" },
      { skillId: "sk-golang", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-docker", "tech-k8s", "tech-aws", "tech-terraform", "tech-go"]
  },
  {
    id: "role-data-eng",
    title: "Data Engineer",
    description: "Design robust batch and real-time streaming data ingestion pipelines, warehouse schemas, and distributed data lakes.",
    demandLevel: "High",
    avgSalary: "$145,000 - $200,000",
    experienceRequired: "2-4 Years",
    domainId: "dom-data",
    requiredSkillIds: [
      { skillId: "sk-python", importance: "Must-Have" },
      { skillId: "sk-sql", importance: "Must-Have" },
      { skillId: "sk-etl", importance: "Must-Have" },
      { skillId: "sk-kafka", importance: "Must-Have" },
      { skillId: "sk-spark", importance: "Good-to-Have" },
      { skillId: "sk-snowflake", importance: "Good-to-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-python", "tech-kafka", "tech-snowflake", "tech-postgres"]
  },
  {
    id: "role-dist-sys-eng",
    title: "Distributed Systems Engineer",
    description: "Build fault-tolerant, low-latency distributed storage systems, consensus algorithms, and ultra-high-throughput networking layers.",
    demandLevel: "High",
    avgSalary: "$160,000 - $230,000",
    experienceRequired: "2-5 Years",
    domainId: "dom-cloud",
    requiredSkillIds: [
      { skillId: "sk-golang", importance: "Must-Have" },
      { skillId: "sk-system-design", importance: "Must-Have" },
      { skillId: "sk-algorithms", importance: "Must-Have" },
      { skillId: "sk-kafka", importance: "Must-Have" },
      { skillId: "sk-redis", importance: "Must-Have" },
      { skillId: "sk-microservices", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-go", "tech-kafka", "tech-redis", "tech-k8s"]
  },
  {
    id: "role-graph-eng",
    title: "Graph Database & Knowledge Engineer",
    description: "Model complex enterprise relationships, knowledge graphs, graph neural networks (GNNs), and graph-enhanced RAG systems.",
    demandLevel: "High",
    avgSalary: "$155,000 - $215,000",
    experienceRequired: "1-3 Years",
    domainId: "dom-ai",
    requiredSkillIds: [
      { skillId: "sk-graph-db", importance: "Must-Have" },
      { skillId: "sk-python", importance: "Must-Have" },
      { skillId: "sk-sql", importance: "Must-Have" },
      { skillId: "sk-llm-rag", importance: "Must-Have" },
      { skillId: "sk-system-design", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-neo4j", "tech-python", "tech-langchain"]
  },
  {
    id: "role-sre-eng",
    title: "Site Reliability Engineer (SRE)",
    description: "Ensure service resilience, low latency, automated incident mitigation, and automated chaos experiments for mission-critical apps.",
    demandLevel: "High",
    avgSalary: "$150,000 - $210,000",
    experienceRequired: "2-4 Years",
    domainId: "dom-sre",
    requiredSkillIds: [
      { skillId: "sk-linux", importance: "Must-Have" },
      { skillId: "sk-k8s", importance: "Must-Have" },
      { skillId: "sk-observability", importance: "Must-Have" },
      { skillId: "sk-golang", importance: "Must-Have" },
      { skillId: "sk-ci-cd", importance: "Good-to-Have" },
      { skillId: "sk-aws-cloud", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-k8s", "tech-go", "tech-docker", "tech-aws"]
  },
  {
    id: "role-sec-eng",
    title: "Cloud & AppSec Engineer",
    description: "Harden cloud infrastructure, automate vulnerability scanning, implement Zero-Trust identity, and protect customer data.",
    demandLevel: "High",
    avgSalary: "$145,000 - $205,000",
    experienceRequired: "2-4 Years",
    domainId: "dom-security",
    requiredSkillIds: [
      { skillId: "sk-appsec", importance: "Must-Have" },
      { skillId: "sk-iam", importance: "Must-Have" },
      { skillId: "sk-aws-cloud", importance: "Must-Have" },
      { skillId: "sk-linux", importance: "Must-Have" },
      { skillId: "sk-docker", importance: "Good-to-Have" }
    ],
    technologyIds: ["tech-aws", "tech-docker", "tech-terraform"]
  }
];

export const COMPANIES: CompanyNode[] = [
  {
    id: "comp-openai",
    name: "OpenAI",
    industry: "Artificial Intelligence",
    tier: "AI Startup",
    headquarters: "San Francisco, CA",
    hiringRoles: [
      { roleId: "role-ml-eng", openPositions: 12, salaryRange: "$220,000 - $350,000" },
      { roleId: "role-ai-app-eng", openPositions: 8, salaryRange: "$200,000 - $310,000" },
      { roleId: "role-dist-sys-eng", openPositions: 6, salaryRange: "$230,000 - $360,000" }
    ]
  },
  {
    id: "comp-anthropic",
    name: "Anthropic",
    industry: "AI Safety & Research",
    tier: "AI Startup",
    headquarters: "San Francisco, CA",
    hiringRoles: [
      { roleId: "role-ml-eng", openPositions: 10, salaryRange: "$210,000 - $340,000" },
      { roleId: "role-ai-app-eng", openPositions: 7, salaryRange: "$195,000 - $300,000" },
      { roleId: "role-graph-eng", openPositions: 4, salaryRange: "$190,000 - $285,000" }
    ]
  },
  {
    id: "comp-google",
    name: "Google / DeepMind",
    industry: "Internet & Technology",
    tier: "FAANG/Tech Giant",
    headquarters: "Mountain View, CA",
    hiringRoles: [
      { roleId: "role-ml-eng", openPositions: 25, salaryRange: "$180,000 - $275,000" },
      { roleId: "role-dist-sys-eng", openPositions: 18, salaryRange: "$175,000 - $265,000" },
      { roleId: "role-sre-eng", openPositions: 14, salaryRange: "$165,000 - $240,000" },
      { roleId: "role-fullstack-eng", openPositions: 20, salaryRange: "$160,000 - $235,000" }
    ]
  },
  {
    id: "comp-meta",
    name: "Meta",
    industry: "Social Media & AI",
    tier: "FAANG/Tech Giant",
    headquarters: "Menlo Park, CA",
    hiringRoles: [
      { roleId: "role-ml-eng", openPositions: 18, salaryRange: "$175,000 - $270,000" },
      { roleId: "role-frontend-eng", openPositions: 15, salaryRange: "$155,000 - $230,000" },
      { roleId: "role-data-eng", openPositions: 12, salaryRange: "$160,000 - $240,000" }
    ]
  },
  {
    id: "comp-stripe",
    name: "Stripe",
    industry: "FinTech & Payments",
    tier: "High-Growth Unicorn",
    headquarters: "South San Francisco, CA",
    hiringRoles: [
      { roleId: "role-backend-eng", openPositions: 16, salaryRange: "$170,000 - $250,000" },
      { roleId: "role-dist-sys-eng", openPositions: 9, salaryRange: "$185,000 - $270,000" },
      { roleId: "role-sec-eng", openPositions: 7, salaryRange: "$170,000 - $245,000" }
    ]
  },
  {
    id: "comp-netflix",
    name: "Netflix",
    industry: "Streaming & Media",
    tier: "FAANG/Tech Giant",
    headquarters: "Los Gatos, CA",
    hiringRoles: [
      { roleId: "role-dist-sys-eng", openPositions: 8, salaryRange: "$200,000 - $320,000" },
      { roleId: "role-data-eng", openPositions: 6, salaryRange: "$190,000 - $300,000" },
      { roleId: "role-sre-eng", openPositions: 5, salaryRange: "$195,000 - $310,000" }
    ]
  },
  {
    id: "comp-databricks",
    name: "Databricks",
    industry: "Data & AI Platform",
    tier: "High-Growth Unicorn",
    headquarters: "San Francisco, CA",
    hiringRoles: [
      { roleId: "role-data-eng", openPositions: 14, salaryRange: "$170,000 - $260,000" },
      { roleId: "role-ml-eng", openPositions: 11, salaryRange: "$180,000 - $275,000" },
      { roleId: "role-graph-eng", openPositions: 5, salaryRange: "$175,000 - $265,000" }
    ]
  },
  {
    id: "comp-snowflake",
    name: "Snowflake",
    industry: "Cloud Data Platform",
    tier: "Enterprise",
    headquarters: "Bozeman, MT",
    hiringRoles: [
      { roleId: "role-data-eng", openPositions: 10, salaryRange: "$165,000 - $250,000" },
      { roleId: "role-data-scientist", openPositions: 8, salaryRange: "$155,000 - $235,000" }
    ]
  },
  {
    id: "comp-amazon",
    name: "Amazon / AWS",
    industry: "Cloud & E-Commerce",
    tier: "FAANG/Tech Giant",
    headquarters: "Seattle, WA",
    hiringRoles: [
      { roleId: "role-devops-eng", openPositions: 30, salaryRange: "$150,000 - $225,000" },
      { roleId: "role-backend-eng", openPositions: 28, salaryRange: "$145,000 - $220,000" },
      { roleId: "role-sre-eng", openPositions: 15, salaryRange: "$155,000 - $230,000" }
    ]
  },
  {
    id: "comp-uber",
    name: "Uber",
    industry: "Mobility & Logistics",
    tier: "Enterprise",
    headquarters: "San Francisco, CA",
    hiringRoles: [
      { roleId: "role-backend-eng", openPositions: 12, salaryRange: "$160,000 - $235,000" },
      { roleId: "role-data-eng", openPositions: 9, salaryRange: "$165,000 - $240,000" },
      { roleId: "role-devops-eng", openPositions: 8, salaryRange: "$155,000 - $225,000" }
    ]
  },
  {
    id: "comp-linear",
    name: "Linear",
    industry: "Developer Tools & Productivity",
    tier: "High-Growth Unicorn",
    headquarters: "Remote",
    hiringRoles: [
      { roleId: "role-frontend-eng", openPositions: 5, salaryRange: "$165,000 - $240,000" },
      { roleId: "role-fullstack-eng", openPositions: 6, salaryRange: "$175,000 - $255,000" }
    ]
  },
  {
    id: "comp-cloudflare",
    name: "Cloudflare",
    industry: "Edge Network & Security",
    tier: "Enterprise",
    headquarters: "San Francisco, CA",
    hiringRoles: [
      { roleId: "role-dist-sys-eng", openPositions: 8, salaryRange: "$175,000 - $260,000" },
      { roleId: "role-sec-eng", openPositions: 10, salaryRange: "$165,000 - $245,000" },
      { roleId: "role-sre-eng", openPositions: 7, salaryRange: "$160,000 - $235,000" }
    ]
  }
];

export const PROJECTS: ProjectNode[] = [
  {
    id: "proj-rag-agent",
    name: "Enterprise Knowledge Graph RAG Agent",
    difficulty: "Advanced",
    description: "Build an autonomous AI assistant combining openCypher graph traversal with vector similarity search for hallucination-free document QA.",
    estimatedHours: 45,
    githubUrl: "https://github.com/careergraph/graph-rag-agent",
    skillIds: ["sk-python", "sk-llm-rag", "sk-graph-db", "sk-fastapi"],
    technologyIds: ["tech-python", "tech-langchain", "tech-neo4j", "tech-fastapi"],
    recommendedForRoleIds: ["role-ai-app-eng", "role-graph-eng", "role-ml-eng"]
  },
  {
    id: "proj-ml-pipeline",
    name: "Real-Time Fraud Detection & MLOps Pipeline",
    difficulty: "Advanced",
    description: "Train PyTorch classification model, track experiments with MLflow, and deploy low-latency ONNX runtime microservices inside Docker containers.",
    estimatedHours: 50,
    githubUrl: "https://github.com/careergraph/mlops-fraud-pipeline",
    skillIds: ["sk-python", "sk-deep-learning", "sk-pytorch", "sk-mlops", "sk-docker"],
    technologyIds: ["tech-python", "tech-pytorch", "tech-docker", "tech-fastapi"],
    recommendedForRoleIds: ["role-ml-eng", "role-data-scientist"]
  },
  {
    id: "proj-dist-kv",
    name: "Distributed In-Memory Key-Value Store with Raft Consensus",
    difficulty: "Advanced",
    description: "Implement a fault-tolerant leader election and replicated log state machine in Go with gRPC inter-node synchronization.",
    estimatedHours: 60,
    githubUrl: "https://github.com/careergraph/raft-distributed-kv",
    skillIds: ["sk-golang", "sk-system-design", "sk-algorithms", "sk-redis"],
    technologyIds: ["tech-go", "tech-redis"],
    recommendedForRoleIds: ["role-dist-sys-eng", "role-sre-eng"]
  },
  {
    id: "proj-saas-dashboard",
    name: "Next.js Real-Time Analytics SaaS Platform",
    difficulty: "Intermediate",
    description: "Full-stack serverless dashboard with Next.js App Router, Tailwind CSS, PostgreSQL indexing, and Stripe billing integration.",
    estimatedHours: 35,
    githubUrl: "https://github.com/careergraph/saas-analytics-nextjs",
    skillIds: ["sk-typescript", "sk-react", "sk-nextjs", "sk-postgres", "sk-tailwind"],
    technologyIds: ["tech-ts", "tech-react", "tech-nextjs", "tech-postgres"],
    recommendedForRoleIds: ["role-fullstack-eng", "role-frontend-eng"]
  },
  {
    id: "proj-k8s-gitops",
    name: "Multi-Cloud GitOps CI/CD & Kubernetes Cluster",
    difficulty: "Intermediate",
    description: "Provision AWS VPC and EKS clusters using Terraform and configure ArgoCD for declarative continuous application deployments.",
    estimatedHours: 40,
    githubUrl: "https://github.com/careergraph/gitops-k8s-terraform",
    skillIds: ["sk-linux", "sk-docker", "sk-k8s", "sk-ci-cd", "sk-aws-cloud", "sk-terraform"],
    technologyIds: ["tech-docker", "tech-k8s", "tech-aws", "tech-terraform"],
    recommendedForRoleIds: ["role-devops-eng", "role-sre-eng"]
  },
  {
    id: "proj-kafka-stream",
    name: "High-Throughput Financial Event Processing Engine",
    difficulty: "Advanced",
    description: "Process 50k events/sec using Apache Kafka, Redis caching, and PostgreSQL time-series partitioning for transaction monitoring.",
    estimatedHours: 45,
    githubUrl: "https://github.com/careergraph/kafka-event-engine",
    skillIds: ["sk-nodejs", "sk-kafka", "sk-redis", "sk-postgres", "sk-system-design"],
    technologyIds: ["tech-nodejs", "tech-kafka", "tech-redis", "tech-postgres"],
    recommendedForRoleIds: ["role-backend-eng", "role-data-eng", "role-dist-sys-eng"]
  },
  {
    id: "proj-sec-scanner",
    name: "Automated Cloud IAM Vulnerability Scanner",
    difficulty: "Intermediate",
    description: "Audit AWS IAM roles, detect overly permissive S3 buckets, and enforce automated least-privilege remediation via AWS SDK.",
    estimatedHours: 30,
    githubUrl: "https://github.com/careergraph/cloud-iam-scanner",
    skillIds: ["sk-python", "sk-iam", "sk-aws-cloud", "sk-appsec"],
    technologyIds: ["tech-python", "tech-aws"],
    recommendedForRoleIds: ["role-sec-eng", "role-devops-eng"]
  },
  {
    id: "proj-react-canvas",
    name: "Collaborative Real-Time Interactive Canvas",
    difficulty: "Intermediate",
    description: "Build an infinite zoom/pan node graph and whiteboard with WebSocket multi-user cursor sync and optimized canvas rendering.",
    estimatedHours: 30,
    githubUrl: "https://github.com/careergraph/collaborative-canvas",
    skillIds: ["sk-typescript", "sk-react", "sk-web-perf", "sk-tailwind"],
    technologyIds: ["tech-ts", "tech-react"],
    recommendedForRoleIds: ["role-frontend-eng", "role-fullstack-eng"]
  }
];

export const COURSES: CourseNode[] = [
  {
    id: "crs-dl-spec",
    title: "Deep Learning Specialization",
    provider: "DeepLearning.AI",
    level: "Intermediate",
    rating: 4.9,
    durationHours: 60,
    url: "https://www.coursera.org/specializations/deep-learning",
    teachesSkillIds: ["sk-deep-learning", "sk-pytorch", "sk-transformers", "sk-nlp"]
  },
  {
    id: "crs-genai-llm",
    title: "Generative AI with Large Language Models",
    provider: "DeepLearning.AI",
    level: "Intermediate",
    rating: 4.8,
    durationHours: 30,
    url: "https://www.deeplearning.ai/courses/generative-ai-with-llms/",
    teachesSkillIds: ["sk-llm-rag", "sk-transformers", "sk-python"]
  },
  {
    id: "crs-graph-cypher",
    title: "Neo4j & CognoDB Graph Database Mastery",
    provider: "Stanford Online",
    level: "Intermediate",
    rating: 4.9,
    durationHours: 25,
    url: "https://online.stanford.edu/courses/graph-databases",
    teachesSkillIds: ["sk-graph-db", "sk-sql"]
  },
  {
    id: "crs-sys-design",
    title: "Distributed Systems & Scalable Architecture",
    provider: "MIT OCW",
    level: "Advanced",
    rating: 4.9,
    durationHours: 45,
    url: "https://ocw.mit.edu/courses/6-824-distributed-systems/",
    teachesSkillIds: ["sk-system-design", "sk-microservices", "sk-golang", "sk-redis"]
  },
  {
    id: "crs-fullstack-ts",
    title: "Enterprise TypeScript & React Architecture",
    provider: "Frontend Masters",
    level: "Intermediate",
    rating: 4.8,
    durationHours: 24,
    url: "https://frontendmasters.com/courses/typescript-v3/",
    teachesSkillIds: ["sk-typescript", "sk-react", "sk-web-perf"]
  },
  {
    id: "crs-docker-k8s",
    title: "Kubernetes & Docker for Production Engineering",
    provider: "Coursera",
    level: "Intermediate",
    rating: 4.8,
    durationHours: 35,
    url: "https://www.coursera.org/learn/google-kubernetes-engine",
    teachesSkillIds: ["sk-docker", "sk-k8s", "sk-ci-cd", "sk-linux"]
  },
  {
    id: "crs-aws-solutions",
    title: "AWS Cloud Solutions Architect Masterclass",
    provider: "Udemy",
    level: "Intermediate",
    rating: 4.7,
    durationHours: 40,
    url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    teachesSkillIds: ["sk-aws-cloud", "sk-iam", "sk-terraform"]
  },
  {
    id: "crs-fastapi-micro",
    title: "Building Modern High-Performance APIs with FastAPI",
    provider: "edX",
    level: "Beginner",
    rating: 4.7,
    durationHours: 20,
    url: "https://www.edx.org/course/fastapi-modern-apis",
    teachesSkillIds: ["sk-fastapi", "sk-rest-api", "sk-python"]
  },
  {
    id: "crs-kafka-data",
    title: "Apache Kafka Event Streaming in Practice",
    provider: "Coursera",
    level: "Advanced",
    rating: 4.8,
    durationHours: 28,
    url: "https://www.coursera.org/learn/apache-kafka-streaming",
    teachesSkillIds: ["sk-kafka", "sk-etl"]
  }
];

export const CERTIFICATIONS: CertificationNode[] = [
  {
    id: "cert-aws-saa",
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    validityYears: 3,
    url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    validatesSkillIds: ["sk-aws-cloud", "sk-iam", "sk-system-design"]
  },
  {
    id: "cert-cka",
    name: "Certified Kubernetes Administrator (CKA)",
    issuer: "Linux Foundation / CNCF",
    validityYears: 3,
    url: "https://www.cncf.io/certification/cka/",
    validatesSkillIds: ["sk-k8s", "sk-docker", "sk-linux"]
  },
  {
    id: "cert-tf-dev",
    name: "TensorFlow / PyTorch Certified Developer",
    issuer: "Google & DeepLearning.AI",
    validityYears: 2,
    url: "https://www.tensorflow.org/certificate",
    validatesSkillIds: ["sk-deep-learning", "sk-pytorch", "sk-ml-basics"]
  },
  {
    id: "cert-terraform",
    name: "HashiCorp Certified: Terraform Associate",
    issuer: "HashiCorp",
    validityYears: 2,
    url: "https://www.hashicorp.com/certification/terraform-associate",
    validatesSkillIds: ["sk-terraform", "sk-aws-cloud"]
  }
];

export const USERS: UserNode[] = [
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
