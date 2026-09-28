export interface SmartSynthesisResult {
  tagline: string;
  description: string;
  features: Array<{ emoji: string; title: string; description: string }>;
  mermaidDiagram: string;
  techStack: Array<{ name: string; category: string; badgeSlug: string; color: string }>;
  installCommands: {
    packageManager: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'pip' | 'docker';
    install: string;
    run: string;
  };
}

export function synthesizeRepoIntelligence(
  repoName: string,
  files: string[],
  commitMessages: string[],
  fallbackDesc: string
): SmartSynthesisResult {
  const combinedText = `${repoName} ${files.join(' ')} ${commitMessages.join(' ')}`.toLowerCase();

  // 1. Detect Domain / Core Subject
  let isConstructionOrCraft = combinedText.includes('stroika') || combinedText.includes('tiling') || combinedText.includes('portfolio') || combinedText.includes('плиточн');
  let isVpnOrNetwork = combinedText.includes('remnawave') || combinedText.includes('vless') || combinedText.includes('vpn') || combinedText.includes('olc');
  let isTaroOrEsoteric = combinedText.includes('taro') || combinedText.includes('astrology') || combinedText.includes('numerology');

  // 2. Synthesize Tagline & Description
  let tagline = fallbackDesc;
  let description = fallbackDesc;

  if (isConstructionOrCraft) {
    tagline = 'Professional Craftsman & Tiling Landing Platform with Live Admin & Lead Hub';
    description = `**${repoName}** — автономный веб-сайт мастера по укладке плитки и отделочным работам в Краснодаре с интегрированной административной панелью, интерактивным до/после слайдером, галереей портфолио и надежной обработкой заявок клиентов с уведомлениями.`;
  } else if (isVpnOrNetwork) {
    tagline = 'Automated Management Panel for RemnaWave & Next-Gen Network Nodes';
    description = `**${repoName}** — комплексная панель управления сетевой инфраструктурой и профилями RemnaWave с автоматическим распределением трафика и мониторингом сессий.`;
  } else if (isTaroOrEsoteric) {
    tagline = 'AI-Powered Esoteric & Tarot Exploration Companion';
    description = `**${repoName}** — интерактивное приложение-навигатор по миру Таро, астрологических раскладов и нумерологии с генеративными ИИ-интерпретациями.`;
  } else if (!tagline || tagline === 'The lightning-fast, zero-ops toolkit for modern developers') {
    // Generate from commit messages
    const firstMeaningfulCommit = commitMessages.find(c => c.length > 15 && !c.startsWith('Initial'));
    tagline = firstMeaningfulCommit ? firstMeaningfulCommit.replace(/^feat:\s*|^fix:\s*/i, '') : `Production-grade web application for ${repoName}`;
    description = `Modern, responsive application built with high code quality, automated workflows, and streamlined architecture.`;
  }

  // 3. Extract Real Features from Commits and File Structure
  const features: Array<{ emoji: string; title: string; description: string }> = [];

  if (files.some(f => f.includes('admin.html') || f.includes('admin'))) {
    features.push({
      emoji: '🎛️',
      title: 'Integrated Admin Panel',
      description: 'Built-in management interface for live content updates, portfolio management, and review moderation.',
    });
  }

  if (combinedText.includes('before/after') || combinedText.includes('slider')) {
    features.push({
      emoji: '🔄',
      title: 'Interactive Before/After Slider',
      description: 'Smooth, pointer-captured comparison widget displaying high-resolution craftsmanship results.',
    });
  }

  if (files.some(f => f.includes('leads.json') || f.includes('email') || combinedText.includes('lead'))) {
    features.push({
      emoji: '📬',
      title: 'Automated Lead Notification Hub',
      description: 'Instant customer lead capture with local JSON persistence and automated email dispatching.',
    });
  }

  if (files.some(f => f.includes('manifest.json') || f.includes('apple-touch-icon') || f.includes('icon-'))) {
    features.push({
      emoji: '📱',
      title: 'PWA & Mobile-First Experience',
      description: 'Progressive Web App support with custom icons, responsive hardware-accelerated dock, and offline readiness.',
    });
  }

  if (files.some(f => f.includes('sitemap.xml') || f.includes('robots.txt') || f.includes('seo'))) {
    features.push({
      emoji: '🔍',
      title: 'Search Engine Optimization (SEO)',
      description: 'Pre-configured sitemap, robots directives, and semantic micro-markup tailored for high search visibility.',
    });
  }

  // Fallback generic features if not detected
  if (features.length === 0) {
    features.push(
      { emoji: '⚡', title: 'Lightning Fast', description: 'Zero bloated dependencies, engineered for instant page load.' },
      { emoji: '🔒', title: 'Secure by Design', description: 'Input sanitation, privacy policy compliance, and anti-bot defense.' },
      { emoji: '📱', title: 'Responsive Layout', description: 'Seamless fluid experience optimized across mobile, tablet, and desktop.' }
    );
  }

  // 4. Construct Real Architecture Mermaid
  const nodes: string[] = [];
  const edges: string[] = [];

  nodes.push(`Visitor(["👤 Client / Visitor"])`);

  if (files.some(f => f.includes('index.html'))) {
    nodes.push(`Landing["🏠 Public Landing Page (index.html)"]`);
    edges.push(`Visitor -->|Views Works| Landing`);
  }

  if (files.some(f => f.includes('admin.html'))) {
    nodes.push(`Admin["🛡️ Admin Dashboard (admin.html)"]`);
    nodes.push(`Owner(["👨‍🔧 Master / Admin"])`);
    edges.push(`Owner -->|Manages Content| Admin`);
  }

  if (files.some(f => f.includes('server.js') || f.includes('server.ts') || f.includes('api/'))) {
    nodes.push(`Server["⚙️ Node.js Server (server.js)"]`);
    edges.push(`Landing -->|POST /api/leads| Server`);
    if (files.some(f => f.includes('admin.html'))) {
      edges.push(`Admin -->|Fetch / Auth| Server`);
    }
  }

  if (files.some(f => f.includes('data/'))) {
    nodes.push(`Storage[("📂 Storage (data/*.json)")]`);
    if (files.some(f => f.includes('server.js'))) {
      edges.push(`Server -->|Saves Leads| Storage`);
    }
  }

  if (combinedText.includes('email') || combinedText.includes('mail')) {
    nodes.push(`Notifier["📧 Mail Delivery / Postfix"]`);
    if (files.some(f => f.includes('server.js'))) {
      edges.push(`Server -->|Alerts| Notifier`);
    }
  }

  const mermaidDiagram = `graph TD
    %% Auto-synthesized Architecture
    ${nodes.join('\n    ')}
    ${edges.join('\n    ')}
    classDef nodeHighlight fill:#1e2235,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
    class Landing,Admin,Server,Storage,Notifier nodeHighlight;`;

  // 5. Tech stack detection
  const techStack: Array<{ name: string; category: string; badgeSlug: string; color: string }> = [];
  if (files.some(f => f.endsWith('.html'))) techStack.push({ name: 'HTML5', category: 'Frontend', badgeSlug: 'html5', color: 'E34F26' });
  if (files.some(f => f.endsWith('.css'))) techStack.push({ name: 'CSS3', category: 'Styling', badgeSlug: 'css3', color: '1572B6' });
  if (files.some(f => f.includes('server.js') || f.endsWith('.js'))) techStack.push({ name: 'JavaScript', category: 'Language', badgeSlug: 'javascript', color: 'F7DF1E' });
  if (files.some(f => f.includes('server.js'))) techStack.push({ name: 'Node.js', category: 'Backend', badgeSlug: 'nodedotjs', color: '339933' });
  if (files.some(f => f.includes('manifest.json'))) techStack.push({ name: 'PWA', category: 'Mobile', badgeSlug: 'pwa', color: '5A0FC8' });

  // 6. Commands
  let pm: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'pip' | 'docker' = 'npm';
  let installCmd = 'npm install';
  let runCmd = 'node server.js';

  if (files.some(f => f.includes('start_local_preview.bat'))) {
    runCmd = 'start_local_preview.bat';
  } else if (!files.some(f => f.includes('server.js')) && files.some(f => f.includes('index.html'))) {
    runCmd = 'npx serve .';
  }

  return {
    tagline,
    description,
    features,
    mermaidDiagram,
    techStack,
    installCommands: {
      packageManager: pm,
      install: files.some(f => f.includes('package.json')) ? installCmd : '# No dependencies required',
      run: runCmd,
    },
  };
}
