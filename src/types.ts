export interface RepoHeroConfig {
  repoName: string;
  tagline: string;
  description: string;
  githubUrl: string;
  owner: string;
  stars: number;
  forks: number;
  license: string;
  primaryLanguage: string;
  languages: Record<string, number>;
  demoUrl?: string;
  
  // Customization
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  badges: {
    stars: boolean;
    license: boolean;
    issues: boolean;
    prs: boolean;
    build: boolean;
    visitors: boolean;
  };
  features: Array<{ title: string; description: string; emoji: string }>;
  techStack: Array<{ name: string; category: string; badgeSlug: string; color: string }>;
  installCommands: {
    packageManager: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'pip' | 'docker';
    install: string;
    run: string;
  };
  architectureMermaid: string;
  changelogItems: Array<{ version: string; date: string; changes: string[] }>;
}

export const DEFAULT_CONFIG: RepoHeroConfig = {
  repoName: 'super-awesome-project',
  tagline: 'The lightning-fast, zero-ops toolkit for modern developers',
  description: 'An open-source, local-first engine designed to supercharge your developer workflow with instant visual previews and smart automation.',
  githubUrl: 'https://github.com/developer/super-awesome-project',
  owner: 'developer',
  stars: 1420,
  forks: 185,
  license: 'MIT',
  primaryLanguage: 'TypeScript',
  languages: { TypeScript: 82, CSS: 12, HTML: 6 },
  demoUrl: 'https://super-awesome-project.dev',
  
  badgeStyle: 'for-the-badge',
  badges: {
    stars: true,
    license: true,
    issues: true,
    prs: true,
    build: true,
    visitors: false,
  },
  features: [
    { emoji: '⚡', title: 'Zero Configuration', description: 'Works right out of the box with intelligent defaults and automated stack detection.' },
    { emoji: '🔒', title: '100% Local & Private', description: 'Zero servers involved. Your sensitive tokens, code, and logs never leave your device.' },
    { emoji: '🎨', title: 'Rich Visuals & Mermaid', description: 'Automatic architecture flowcharts, sequence diagrams, and interactive badges.' },
    { emoji: '📦', title: 'Multi-Runtime Support', description: 'First-class support for Node, Bun, Python, Rust, Go, and Docker environments.' },
  ],
  techStack: [
    { name: 'TypeScript', category: 'Language', badgeSlug: 'typescript-%23007ACC.svg', color: '3178C6' },
    { name: 'React 19', category: 'Frontend', badgeSlug: 'react-%2320232a.svg', color: '61DAFB' },
    { name: 'Vite', category: 'Bundler', badgeSlug: 'vite-%23646CFF.svg', color: '646CFF' },
    { name: 'Mermaid', category: 'Diagrams', badgeSlug: 'mermaid-%23FF3670.svg', color: 'FF3670' },
  ],
  installCommands: {
    packageManager: 'pnpm',
    install: 'pnpm install',
    run: 'pnpm dev',
  },
  architectureMermaid: `graph TD
    Client[Web / Desktop UI] -->|Local FileSystem API| Parser[Repo Parser Engine]
    Client -->|REST Fetch| GitHubAPI[GitHub Public API]
    Parser --> StateStore[Local State & Cache]
    GitHubAPI --> StateStore
    StateStore --> MarkdownGen[Markdown & Shields Builder]
    StateStore --> MermaidGen[Mermaid Diagrams]
    MarkdownGen --> LivePreview[Live GitHub Preview]
    LivePreview --> Export[Copy / Download README.md]`,
  changelogItems: [
    {
      version: 'v1.2.0',
      date: '2026-09-28',
      changes: ['Added live Mermaid.js diagram viewer', 'Integrated GitHub public API fetcher', 'Added for-the-badge Shields style support'],
    },
    {
      version: 'v1.1.0',
      date: '2026-09-15',
      changes: ['Support for local file drag-and-drop parsing', 'Dark / Light theme toggle'],
    },
    {
      version: 'v1.0.0',
      date: '2026-09-01',
      changes: ['Initial release of RepoHero generator'],
    },
  ],
};
