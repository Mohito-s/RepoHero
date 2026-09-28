import type { RepoHeroConfig } from './types';

export function generateMarkdown(config: RepoHeroConfig): string {
  const {
    repoName,
    tagline,
    description,
    githubUrl,
    owner,
    badgeStyle,
    badges,
    features,
    techStack,
    installCommands,
    architectureMermaid,
    changelogItems,
    demoUrl,
  } = config;

  const styleParam = `style=${badgeStyle}`;
  const badgeList: string[] = [];

  if (badges.stars && owner && repoName) {
    badgeList.push(`[![GitHub Stars](https://img.shields.io/github/stars/${owner}/${repoName}?${styleParam}&logo=github)](https://github.com/${owner}/${repoName}/stargazers)`);
  }
  if (badges.license && owner && repoName) {
    badgeList.push(`[![License](https://img.shields.io/github/license/${owner}/${repoName}?${styleParam}&color=blue)](LICENSE)`);
  }
  if (badges.issues && owner && repoName) {
    badgeList.push(`[![Issues](https://img.shields.io/github/issues/${owner}/${repoName}?${styleParam}&color=yellow)](https://github.com/${owner}/${repoName}/issues)`);
  }
  if (badges.prs && owner && repoName) {
    badgeList.push(`[![Pull Requests](https://img.shields.io/github/issues-pr/${owner}/${repoName}?${styleParam}&color=brightgreen)](https://github.com/${owner}/${repoName}/pulls)`);
  }
  if (badges.build && owner && repoName) {
    badgeList.push(`[![Build](https://img.shields.io/github/actions/workflow/status/${owner}/${repoName}/ci.yml?branch=main&${styleParam}&logo=githubactions)](https://github.com/${owner}/${repoName}/actions)`);
  }

  // Tech stack badges
  const stackBadges = techStack.map(
    (tech) => `![${tech.name}](https://img.shields.io/badge/${encodeURIComponent(tech.name)}-${tech.color}?${styleParam}&logo=${encodeURIComponent(tech.name.toLowerCase().split(' ')[0])}&logoColor=white)`
  ).join(' ');

  let md = `<div align="center">

# ${repoName}

**${tagline}**

${badgeList.join('\n')}

<p align="center">
  ${demoUrl ? `[Explore Demo](${demoUrl}) • ` : ''}[Report Bug](${githubUrl}/issues) • [Request Feature](${githubUrl}/issues)
</p>

</div>

---

## 📖 Overview

${description}

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
${features.map((f) => `| ${f.emoji} **${f.title}** | ${f.description} |`).join('\n')}

---

## 🛠 Tech Stack

${stackBadges || '*(Configurable in settings)*'}

---

## 🏛 Architecture

\`\`\`mermaid
${architectureMermaid.trim()}
\`\`\`

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [${installCommands.packageManager}](https://www.google.com/search?q=${installCommands.packageManager}) installed on your machine.

### Installation

\`\`\`bash
# 1. Clone the repository
git clone ${githubUrl}.git

# 2. Enter repository directory
cd ${repoName}

# 3. Install project dependencies
${installCommands.install}

# 4. Start local development server
${installCommands.run}
\`\`\`

---

## 📋 Changelog

${changelogItems
  .map(
    (item) => `### ${item.version} (${item.date})
${item.changes.map((c) => `- ${c}`).join('\n')}`
  )
  .join('\n\n')}

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
Feel free to check [issues page](${githubUrl}/issues).

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📝 License

Distributed under the **${config.license || 'MIT'} License**. See \`LICENSE\` for more information.

<div align="center">
  <sub>Built with ❤️ using <a href="https://github.com">RepoHero</a></sub>
</div>
`;

  return md;
}
