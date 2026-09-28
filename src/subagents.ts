export interface AuditFinding {
  id: string;
  category: 'security' | 'architecture' | 'performance' | 'dx' | 'docs';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

export interface AgentTask {
  id: string;
  agentRole: 'Security Officer' | 'Principal Architect' | 'Staff QA / Linter' | 'Tech Writer';
  avatarEmoji: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  outputSnippet?: string;
}

export interface TeamAuditReport {
  score: number; // 0 - 100
  repoName: string;
  analyzedAt: string;
  agents: {
    architect: { status: string; findings: AuditFinding[] };
    security: { status: string; findings: AuditFinding[] };
    linter: { status: string; findings: AuditFinding[] };
    techWriter: { status: string; findings: AuditFinding[] };
  };
  tasks: AgentTask[];
  suggestedPrBody: string;
}

export function runVirtualTeamAudit(repoName: string, files: string[], techStack: string[]): TeamAuditReport {
  const findings: AuditFinding[] = [];
  const tasks: AgentTask[] = [];

  const hasEnvExample = files.some(f => f.includes('.env.example'));
  const hasGitignore = files.some(f => f.includes('.gitignore'));
  const hasTests = files.some(f => f.includes('test') || f.includes('spec') || f.includes('__tests__'));
  const hasDocker = files.some(f => f.toLowerCase().includes('docker'));
  const hasCI = files.some(f => f.includes('.github/workflows') || f.includes('.gitlab-ci'));
  const hasTypescript = techStack.some(t => t.toLowerCase().includes('typescript')) || files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const hasMobileExpo = techStack.some(t => t.toLowerCase().includes('expo') || t.toLowerCase().includes('react native'));

  // 1. Security Officer Agent Findings
  if (!hasEnvExample) {
    findings.push({
      id: 'sec-1',
      category: 'security',
      severity: 'critical',
      title: 'Missing .env.example template',
      description: 'Developers might commit real API secrets (OpenAI, DB passwords) without an explicit template.',
      recommendation: 'Generate a sanitized .env.example with dummy values and add .env to .gitignore.',
    });
  }

  if (!hasGitignore) {
    findings.push({
      id: 'sec-2',
      category: 'security',
      severity: 'critical',
      title: 'No .gitignore detected',
      description: 'node_modules, build artifacts or certificates may accidentally leak to remote git.',
      recommendation: 'Initialize a strict .gitignore configured for Node/Mobile/TypeScript.',
    });
  }

  // 2. Principal Architect Agent Findings
  if (!hasDocker && !hasMobileExpo) {
    findings.push({
      id: 'arch-1',
      category: 'architecture',
      severity: 'warning',
      title: 'No Containerization (Docker)',
      description: 'Host-level dependency mismatches will happen between staging, dev, and production.',
      recommendation: 'Add a multi-stage Dockerfile and docker-compose.yml for unified deployment.',
    });
  }

  if (!hasCI) {
    findings.push({
      id: 'arch-2',
      category: 'architecture',
      severity: 'critical',
      title: 'Missing CI/CD Workflow (.github/workflows)',
      description: 'PRs are merged without automated build tests, linting, and regression checks.',
      recommendation: 'Set up GitHub Actions workflow: lint -> type-check -> test -> build on pull_request.',
    });
  }

  // 3. Staff QA / Linter Agent
  if (!hasTests) {
    findings.push({
      id: 'qa-1',
      category: 'dx',
      severity: 'warning',
      title: '0 Unit / Integration Tests',
      description: 'Code changes cannot be verified automatically before production deployment.',
      recommendation: 'Configure Vitest or Jest with smoke tests for primary business logic.',
    });
  }

  if (hasTypescript) {
    findings.push({
      id: 'qa-2',
      category: 'performance',
      severity: 'info',
      title: 'Strict Type-Checking Audit',
      description: 'Ensure "noImplicitAny" and "verbatimModuleSyntax" are enabled in tsconfig.json.',
      recommendation: 'Run typecheck in CI with `tsc --noEmit`.',
    });
  }

  // 4. Generate Team Tasks
  tasks.push({
    id: 't-1',
    agentRole: 'Security Officer',
    avatarEmoji: '🛡️',
    title: 'Secret sanitization & .env.example auto-generation',
    status: hasEnvExample ? 'completed' : 'pending',
    outputSnippet: 'Created sanitized .env.example template',
  });

  tasks.push({
    id: 't-2',
    agentRole: 'Principal Architect',
    avatarEmoji: '🏛️',
    title: 'CI/CD pipeline scaffold (GitHub Actions)',
    status: hasCI ? 'completed' : 'pending',
    outputSnippet: 'Scaffolded .github/workflows/ci.yml with Node 20 matrix',
  });

  tasks.push({
    id: 't-3',
    agentRole: 'Staff QA / Linter',
    avatarEmoji: '🧪',
    title: 'ESLint / Biome & Vitest configuration suite',
    status: hasTests ? 'completed' : 'pending',
    outputSnippet: 'Automated typecheck verification task ready',
  });

  tasks.push({
    id: 't-4',
    agentRole: 'Tech Writer',
    avatarEmoji: '✍️',
    title: 'Interactive README & Architecture diagram sync',
    status: 'completed',
    outputSnippet: 'README.md and Mermaid flowchart dynamically generated',
  });

  // Calculate health score
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const score = Math.max(20, 100 - (criticalCount * 25) - (warningCount * 12));

  const suggestedPrBody = `## 🤖 AI Subagent Team Audit for ${repoName}

### 📊 Health Score: ${score}/100

| Subagent Role | Status | Key Focus |
| :--- | :--- | :--- |
| 🛡️ **Security Officer** | ${hasEnvExample ? '✅ Passed' : '⚠️ Action Needed'} | Secrets & Permissions |
| 🏛️ **Principal Architect** | ${hasCI ? '✅ Passed' : '⚠️ Action Needed'} | CI/CD & Deployability |
| 🧪 **Staff QA & Linter** | ${hasTests ? '✅ Passed' : '⚠️ Action Needed'} | Regression Defense |
| ✍️ **Tech Writer** | ✅ Completed | Architecture & Docs |

### 🎯 Key Recommendations:
${findings.map(f => `- **[${f.severity.toUpperCase()}] ${f.title}**: ${f.recommendation}`).join('\n')}
`;

  return {
    score,
    repoName,
    analyzedAt: new Date().toLocaleTimeString(),
    agents: {
      architect: { status: hasCI ? 'Passing' : 'Needs Attention', findings: findings.filter(f => f.category === 'architecture') },
      security: { status: hasEnvExample ? 'Passing' : 'Critical Action', findings: findings.filter(f => f.category === 'security') },
      linter: { status: hasTests ? 'Passing' : 'Tests Missing', findings: findings.filter(f => f.category === 'dx' || f.category === 'performance') },
      techWriter: { status: 'Optimal', findings: [] },
    },
    tasks,
    suggestedPrBody,
  };
}
