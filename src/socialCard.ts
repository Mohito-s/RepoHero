import type { RepoHeroConfig } from './types';

// Detect architectural components from file tree
export function analyzeProjectTree(filePaths: string[]): {
  components: Array<{ name: string; type: string; details: string }>;
  mermaidDiagram: string;
} {
  const hasFrontend = filePaths.some(p => p.includes('src/') || p.includes('pages/') || p.includes('components/'));
  const hasBackend = filePaths.some(p => p.includes('api/') || p.includes('server/') || p.includes('controllers/'));
  const hasDatabase = filePaths.some(p => p.includes('prisma') || p.includes('schema.sql') || p.includes('models/'));
  const hasDocker = filePaths.some(p => p.toLowerCase().includes('docker'));
  const hasTests = filePaths.some(p => p.includes('test') || p.includes('spec'));

  const nodes: string[] = [];
  const edges: string[] = [];

  nodes.push(`User([👤 User / Browser])`);

  if (hasFrontend) {
    nodes.push(`UI[💻 Frontend Client]`);
    edges.push(`User -->|Interacts| UI`);
  }

  if (hasBackend) {
    nodes.push(`API[⚙️ Backend / API Server]`);
    if (hasFrontend) {
      edges.push(`UI -->|REST / JSON| API`);
    } else {
      edges.push(`User -->|HTTP Requests| API`);
    }
  }

  if (hasDatabase) {
    nodes.push(`DB[(🗄️ Database / Storage)]`);
    if (hasBackend) {
      edges.push(`API -->|Queries & Mutations| DB`);
    }
  }

  if (hasDocker) {
    nodes.push(`Docker[🐳 Container / Dockerized Environment]`);
  }

  const mermaidDiagram = `graph TD
    %% Auto-detected Architecture Map
    ${nodes.join('\n    ')}
    ${edges.join('\n    ')}
    classDef highlight fill:#6366f1,stroke:#a855f7,stroke-width:2px,color:#fff;
    class UI,API,DB highlight;`;

  return {
    components: [
      ...(hasFrontend ? [{ name: 'Frontend', type: 'UI', details: 'Client-side application' }] : []),
      ...(hasBackend ? [{ name: 'Backend', type: 'Server', details: 'API / Business Logic' }] : []),
      ...(hasDatabase ? [{ name: 'Database', type: 'Persistence', details: 'Data storage / ORM' }] : []),
      ...(hasDocker ? [{ name: 'DevOps', type: 'Containers', details: 'Docker configuration detected' }] : []),
      ...(hasTests ? [{ name: 'Testing', type: 'QA', details: 'Unit / Integration tests found' }] : []),
    ],
    mermaidDiagram,
  };
}

// Generate an SVG Social Preview Card (1280x640 standard GitHub/OpenGraph banner)
export function generateSocialCardSvg(config: RepoHeroConfig): string {
  const { repoName, tagline, primaryLanguage, stars, forks, license } = config;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" width="1280" height="640">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0d14"/>
      <stop offset="50%" stop-color="#141724"/>
      <stop offset="100%" stop-color="#1a142e"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1280" height="640" fill="url(#bgGrad)"/>
  
  <!-- Ambient Glow Circles -->
  <circle cx="200" cy="150" r="180" fill="#6366f1" opacity="0.12" filter="url(#glow)"/>
  <circle cx="1080" cy="450" r="220" fill="#ec4899" opacity="0.12" filter="url(#glow)"/>
  
  <!-- Subtle Grid lines -->
  <path d="M 0,160 L 1280,160 M 0,320 L 1280,320 M 0,480 L 1280,480" stroke="#232738" stroke-width="1" opacity="0.4"/>
  <path d="M 320,0 L 320,640 M 640,0 L 640,640 M 960,0 L 960,640" stroke="#232738" stroke-width="1" opacity="0.4"/>

  <!-- Brand Pill -->
  <g transform="translate(100, 100)">
    <rect width="140" height="34" rx="17" fill="#202436" stroke="#3b4261" stroke-width="1"/>
    <text x="70" y="22" fill="#a855f7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="14" font-weight="600" text-anchor="middle">✨ OPEN SOURCE</text>
  </g>

  <!-- Repo Title -->
  <text x="100" y="230" fill="url(#brandGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="68" font-weight="800" letter-spacing="-1.5">
    ${escapeXml(repoName)}
  </text>

  <!-- Tagline -->
  <text x="100" y="300" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="26" font-weight="400" width="1000">
    ${escapeXml(truncateText(tagline, 75))}
  </text>

  <!-- Metrics Cards Box -->
  <g transform="translate(100, 460)">
    <!-- Primary Language -->
    <rect x="0" y="0" width="220" height="90" rx="14" fill="#141724" stroke="#2d334a" stroke-width="1.5"/>
    <text x="24" y="36" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="14" font-weight="600">LANGUAGE</text>
    <text x="24" y="70" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="24" font-weight="700">⚡ ${escapeXml(primaryLanguage || 'TypeScript')}</text>

    <!-- Stars -->
    <rect x="250" y="0" width="180" height="90" rx="14" fill="#141724" stroke="#2d334a" stroke-width="1.5"/>
    <text x="274" y="36" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="14" font-weight="600">STARS</text>
    <text x="274" y="70" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="24" font-weight="700">⭐ ${stars.toLocaleString()}</text>

    <!-- Forks -->
    <rect x="460" y="0" width="180" height="90" rx="14" fill="#141724" stroke="#2d334a" stroke-width="1.5"/>
    <text x="484" y="36" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="14" font-weight="600">FORKS</text>
    <text x="484" y="70" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="24" font-weight="700">🍴 ${forks.toLocaleString()}</text>

    <!-- License -->
    <rect x="670" y="0" width="180" height="90" rx="14" fill="#141724" stroke="#2d334a" stroke-width="1.5"/>
    <text x="694" y="36" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="14" font-weight="600">LICENSE</text>
    <text x="694" y="70" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto" font-size="24" font-weight="700">📜 ${escapeXml(license || 'MIT')}</text>
  </g>
</svg>`;
}

function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(str: string, maxLength: number) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}
