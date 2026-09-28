import { DEFAULT_CONFIG, type RepoHeroConfig } from './types';

export async function fetchGitHubRepoData(repoInput: string): Promise<Partial<RepoHeroConfig>> {
  // Support either "owner/repo" or "https://github.com/owner/repo"
  let clean = repoInput.trim();
  clean = clean.replace(/^https?:\/\/github\.com\//i, '');
  clean = clean.replace(/\/+$/, '');
  clean = clean.replace(/\.git$/i, '');

  const parts = clean.split('/');
  if (parts.length < 2) {
    throw new Error('Please enter in format "owner/repo" or full GitHub URL');
  }

  const [owner, repo] = parts;
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again shortly.');
    }
    throw new Error(`GitHub error: ${res.statusText}`);
  }

  const data = await res.json();

  // Try fetching git tree to detect real architecture (controllers, prisma, tests, docker)
  // Fetch full tree and recent commits for smart intelligence synthesis
  let smartResult: any = null;
  try {
    const defaultBranch = data.default_branch || 'main';
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`);
    
    let filePaths: string[] = [];
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      filePaths = (treeData.tree || []).map((item: any) => item.path as string);
    }

    let commitMessages: string[] = [];
    if (commitsRes.ok) {
      const commitsData = await commitsRes.json();
      commitMessages = (commitsData || []).map((c: any) => c.commit?.message as string).filter(Boolean);
    }

    if (filePaths.length > 0 || commitMessages.length > 0) {
      const { synthesizeRepoIntelligence } = await import('./intelligence');
      smartResult = synthesizeRepoIntelligence(data.name || repo, filePaths, commitMessages, data.description || '');
    }
  } catch {
    // optional fallback
  }

  // Try fetching raw README.md if exists to pull description
  let readmeDesc = data.description || '';
  try {
    const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${data.default_branch || 'main'}/README.md`);
    if (readmeRes.ok) {
      const text = await readmeRes.text();
      // Extract first meaningful paragraph from README
      const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('!') && !l.startsWith('[') && !l.startsWith('<'));
      if (lines.length > 0) {
        readmeDesc = lines.slice(0, 3).join(' ').trim();
      }
    }
  } catch {
    // optional
  }

  // Try fetching languages
  let languages: Record<string, number> = {};
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    if (langRes.ok) {
      languages = await langRes.json();
    }
  } catch {
    // optional fallback
  }

  // Map known languages to badges
  const detectedStack = Object.keys(languages).slice(0, 5).map((lang) => {
    return {
      name: lang,
      category: 'Language',
      badgeSlug: `${lang.toLowerCase()}-badge`,
      color: '3178C6',
    };
  });

  // Package manager guessing
  let pm: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'pip' | 'docker' = 'npm';
  let installCmd = 'npm install';
  let runCmd = 'npm run dev';

  if (data.language === 'Rust') {
    pm = 'cargo';
    installCmd = 'cargo build';
    runCmd = 'cargo run';
  } else if (data.language === 'Python') {
    pm = 'pip';
    installCmd = 'pip install -r requirements.txt';
    runCmd = 'python main.py';
  }

  return {
    repoName: data.name || repo,
    owner: data.owner?.login || owner,
    githubUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    tagline: smartResult?.tagline || data.description || readmeDesc || DEFAULT_CONFIG.tagline,
    description: smartResult?.description || readmeDesc || data.description || DEFAULT_CONFIG.description,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    license: data.license?.spdx_id || data.license?.name || 'MIT',
    primaryLanguage: data.language || 'TypeScript',
    languages: {},
    demoUrl: data.homepage || '',
    features: smartResult?.features || DEFAULT_CONFIG.features,
    techStack: smartResult?.techStack || (detectedStack.length > 0 ? detectedStack : DEFAULT_CONFIG.techStack),
    architectureMermaid: smartResult?.mermaidDiagram || DEFAULT_CONFIG.architectureMermaid,
    installCommands: smartResult?.installCommands || {
      packageManager: pm,
      install: installCmd,
      run: runCmd,
    },
  };
}

export function parsePackageJsonLocally(content: string, currentOwner: string = 'your-username'): Partial<RepoHeroConfig> {
  try {
    const pkg = JSON.parse(content);
    // Support app.json (Expo / React Native / Electron) or standard package.json
    const expo = pkg.expo || pkg;
    const name = expo.name || pkg.name || 'my-project';
    const slug = (expo.slug || name).toLowerCase().replace(/[^a-z0-9_-]/gi, '-');
    const description = expo.description || pkg.description || DEFAULT_CONFIG.description;

    const techStack: Array<{ name: string; category: string; badgeSlug: string; color: string }> = [];

    // If expo found
    if (pkg.expo || pkg.dependencies?.['expo']) {
      techStack.push({ name: 'Expo', category: 'Framework', badgeSlug: 'expo', color: '000020' });
      techStack.push({ name: 'React Native', category: 'Mobile', badgeSlug: 'react', color: '61DAFB' });
    }

    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    
    if (allDeps['react'] && !techStack.some(t => t.name.includes('React'))) {
      techStack.push({ name: 'React', category: 'Frontend', badgeSlug: 'react', color: '61DAFB' });
    }
    if (allDeps['vue']) techStack.push({ name: 'Vue', category: 'Frontend', badgeSlug: 'vue', color: '4FC08D' });
    if (allDeps['typescript']) techStack.push({ name: 'TypeScript', category: 'Language', badgeSlug: 'typescript', color: '3178C6' });
    if (allDeps['vite']) techStack.push({ name: 'Vite', category: 'Bundler', badgeSlug: 'vite', color: '646CFF' });
    if (allDeps['tailwindcss']) techStack.push({ name: 'Tailwind CSS', category: 'Styling', badgeSlug: 'tailwind', color: '06B6D4' });
    if (allDeps['express'] || allDeps['fastify'] || allDeps['koa']) techStack.push({ name: 'Node.js', category: 'Backend', badgeSlug: 'nodejs', color: '339933' });

    let pm: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'pip' | 'docker' = 'npm';
    let install = 'npm install';
    let run = pkg.scripts?.dev ? 'npm run dev' : (pkg.scripts?.start ? 'npm start' : 'npm test');

    if (pkg.expo || allDeps['expo']) {
      run = 'npx expo start';
    }

    const safeOwner = currentOwner || 'your-username';

    return {
      repoName: name,
      owner: safeOwner,
      githubUrl: `https://github.com/${safeOwner}/${slug}`,
      description: description,
      tagline: description,
      license: pkg.license || 'MIT',
      techStack: techStack.length > 0 ? techStack : DEFAULT_CONFIG.techStack,
      installCommands: {
        packageManager: pm,
        install,
        run,
      },
    };
  } catch (e) {
    throw new Error('Failed to parse file: ' + (e as Error).message);
  }
}
