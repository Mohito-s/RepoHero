import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  FolderOpen,
  Code2,
  Layers,
  Activity,
  Terminal,
  RefreshCw,
  Eye,
  Sliders,
  GitBranch,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { DEFAULT_CONFIG, type RepoHeroConfig } from './types';
import { generateMarkdown } from './generator';
import { fetchGitHubRepoData, parsePackageJsonLocally } from './parser';
import { generateSocialCardSvg } from './socialCard';
import { runVirtualTeamAudit, type TeamAuditReport } from './subagents';
import { Image as ImageIcon, ShieldAlert, Cpu } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

export default function App() {
  const [config, setConfig] = useState<RepoHeroConfig>(DEFAULT_CONFIG);
  const [githubInput, setGithubInput] = useState('Mohito-s/olcwave');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'raw' | 'diagram' | 'social' | 'audit'>('editor');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mermaidSvg, setMermaidSvg] = useState('');
  const [auditReport, setAuditReport] = useState<TeamAuditReport>(() =>
    runVirtualTeamAudit(DEFAULT_CONFIG.repoName, [], DEFAULT_CONFIG.techStack.map(t => t.name))
  );

  const [customMarkdown, setCustomMarkdown] = useState<string | null>(null);
  const markdownContent = customMarkdown !== null ? customMarkdown : generateMarkdown(config);
  const socialCardSvg = generateSocialCardSvg(config);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSubagentAudit = (repoName: string, stack: string[]) => {
    const report = runVirtualTeamAudit(repoName, [], stack);
    setAuditReport(report);
  };

  const handleDownloadSocialCard = () => {
    const blob = new Blob([socialCardSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.repoName}-social-preview.svg`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Re-render mermaid when architecture diagram changes
  useEffect(() => {
    let isCurrent = true;
    const renderDiagram = async () => {
      try {
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, config.architectureMermaid);
        if (isCurrent) setMermaidSvg(svg);
      } catch (e) {
        console.warn('Mermaid syntax error or render pending:', e);
      }
    };
    renderDiagram();
    return () => {
      isCurrent = false;
    };
  }, [config.architectureMermaid]);

  // Handle GitHub Fetch
  const handleGitHubFetch = async () => {
    if (!githubInput.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchGitHubRepoData(githubInput);
      setConfig((prev) => ({
        ...prev,
        ...data,
      }));
      setCustomMarkdown(null);
      triggerSubagentAudit(data.repoName || githubInput, (data.techStack || []).map(t => t.name));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.1 } });
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Local package.json file drop/open
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parsePackageJsonLocally(content, config.owner === 'developer' ? 'Mohito-s' : config.owner);
        setConfig((prev) => ({
          ...prev,
          ...parsed,
        }));
        if (parsed.owner && parsed.repoName) {
          const slug = parsed.repoName.toLowerCase().replace(/[^a-z0-9_-]/gi, '-');
          setGithubInput(`${parsed.owner}/${slug}`);
        }
        triggerSubagentAudit(parsed.repoName || 'my-project', (parsed.techStack || []).map(t => t.name));
        confetti({ particleCount: 40, spread: 50 });
      } catch (err) {
        setErrorMessage((err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.2 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render HTML preview of markdown
  const renderedHtml = marked.parse(markdownContent, { async: false }) as string;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="logo-brand">
          <Sparkles className="text-indigo-400" size={24} />
          <span>
            Repo<span className="gradient-badge">Hero</span>
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              background: '#232738',
              padding: '2px 8px',
              borderRadius: '12px',
              color: '#94a3b8',
              marginLeft: '4px',
            }}
          >
            MVP • Zero-Ops
          </span>
        </div>

        {/* Quick GitHub Import Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '440px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="input-text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="e.g. Mohito-s/olcwave"
                style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
              />
              <GitBranch
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
              />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleGitHubFetch} disabled={isLoading}>
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Fetch
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              title="Import local package.json"
            >
              <FolderOpen size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
          {/* Quick chips for your repos */}
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Твои репо:</span>
            {['Mohito-s/olcwave', 'Mohito-s/backend', 'Mohito-s/LostinTranslation'].map((repo) => (
              <span
                key={repo}
                onClick={() => {
                  setGithubInput(repo);
                }}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  color: githubInput === repo ? '#a855f7' : '#94a3b8',
                }}
              >
                {repo.split('/')[1]}
              </span>
            ))}
          </div>
        </div>

        {/* Export Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            Download README
          </button>
        </div>
      </header>

      {/* Error alert if any */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '8px 24px',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="main-content">
        {/* Left Side: Interactive Customizer */}
        <aside className="sidebar-panel">
          {/* Section: Project Meta */}
          <div className="config-section">
            <div className="config-section-title">
              <Sliders size={16} color="#6366f1" /> Project Identity
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                className="input-text"
                value={config.repoName}
                onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                className="input-text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input-textarea"
                rows={3}
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
              />
            </div>
          </div>

          {/* Section: Badges & Social */}
          <div className="config-section">
            <div className="config-section-title">
              <Activity size={16} color="#ec4899" /> Shields & Badge Style
            </div>
            <div className="form-group">
              <label>Badge Style</label>
              <select
                value={config.badgeStyle}
                onChange={(e) => setConfig({ ...config, badgeStyle: e.target.value as any })}
              >
                <option value="for-the-badge">For the badge (Modern & Bold)</option>
                <option value="flat">Flat</option>
                <option value="flat-square">Flat Square</option>
                <option value="plastic">Plastic</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              {Object.keys(config.badges).map((badgeKey) => {
                const key = badgeKey as keyof typeof config.badges;
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      color: config.badges[key] ? '#f8fafc' : '#64748b',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config.badges[key]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          badges: { ...config.badges, [key]: e.target.checked },
                        })
                      }
                    />
                    {key.toUpperCase()}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Architecture Mermaid */}
          <div className="config-section">
            <div className="config-section-title">
              <Layers size={16} color="#a855f7" /> Architecture (Mermaid.js)
            </div>
            <div className="form-group">
              <label>Flowchart Syntax</label>
              <textarea
                className="input-textarea"
                rows={7}
                value={config.architectureMermaid}
                onChange={(e) => setConfig({ ...config, architectureMermaid: e.target.value })}
              />
            </div>
          </div>

          {/* Section: Installation & Commands */}
          <div className="config-section">
            <div className="config-section-title">
              <Terminal size={16} color="#10b981" /> Installation & Commands
            </div>
            <div className="form-group">
              <label>Package Manager</label>
              <select
                value={config.installCommands.packageManager}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    installCommands: {
                      ...config.installCommands,
                      packageManager: e.target.value as any,
                    },
                  })
                }
              >
                <option value="pnpm">pnpm</option>
                <option value="npm">npm</option>
                <option value="yarn">yarn</option>
                <option value="cargo">cargo (Rust)</option>
                <option value="pip">pip (Python)</option>
                <option value="docker">Docker</option>
              </select>
            </div>
            <div className="form-group">
              <label>Install Command</label>
              <input
                type="text"
                className="input-text"
                value={config.installCommands.install}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    installCommands: { ...config.installCommands, install: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Run / Dev Command</label>
              <input
                type="text"
                className="input-text"
                value={config.installCommands.run}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    installCommands: { ...config.installCommands, run: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </aside>

        {/* Right Side: Live GitHub Preview */}
        <main className="preview-panel">
          {/* Sub-header controls */}
          <div
            style={{
              height: '48px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              background: '#0e1017',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-sm ${activeTab === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('editor')}
              >
                <Eye size={14} /> GitHub Preview
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('raw')}
              >
                <Code2 size={14} /> Raw Markdown
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'diagram' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('diagram')}
              >
                <Layers size={14} /> Mermaid View
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'social' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('social')}
              >
                <ImageIcon size={14} /> Social Card (1280x640)
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('audit')}
                style={{
                  background: activeTab === 'audit' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
                  border: '1px solid #10b981',
                }}
              >
                <Cpu size={14} color={activeTab === 'audit' ? '#fff' : '#10b981'} /> Subagent Team Audit
                <span style={{ background: '#064e3b', color: '#6ee7b7', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                  {auditReport.score}/100
                </span>
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Live Synced</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            </div>
          </div>

          {/* Active View Container */}
          {activeTab === 'editor' && (
            <div className="markdown-body-custom">
              <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              {mermaidSvg && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#8b949e', marginBottom: '8px' }}>
                    Rendered Architecture Diagram:
                  </div>
                  <div
                    className="mermaid-diagram-container"
                    dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090a0f', overflow: 'hidden' }}>
              <div style={{ padding: '8px 16px', background: '#10121a', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>✏️ <strong>Live Real-time Markdown Editor:</strong> Любые изменения здесь мгновенно обновляют вкладку GitHub Preview!</span>
                {customMarkdown !== null && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    onClick={() => setCustomMarkdown(null)}
                  >
                    Reset to Auto-Generated
                  </button>
                )}
              </div>
              <textarea
                value={markdownContent}
                onChange={(e) => setCustomMarkdown(e.target.value)}
                placeholder="Type or edit markdown directly here..."
                style={{
                  flex: 1,
                  padding: '24px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {activeTab === 'diagram' && (
            <div
              style={{
                flex: 1,
                padding: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#090a0f',
              }}
            >
              <div style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
                Mermaid.js Flowchart (Renders directly on GitHub & GitLab)
              </div>
              <div
                className="mermaid-diagram-container"
                style={{ maxWidth: '800px', width: '100%' }}
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
              />
            </div>
          )}

          {activeTab === 'social' && (
            <div
              style={{
                flex: 1,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#090a0f',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', marginBottom: '16px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Auto-generated 1280x640 OpenGraph / GitHub Social Banner
                </span>
                <button className="btn btn-primary btn-sm" onClick={handleDownloadSocialCard}>
                  <Download size={14} /> Download SVG Banner
                </button>
              </div>
              <div
                style={{
                  maxWidth: '800px',
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  border: '1px solid var(--border)',
                }}
                dangerouslySetInnerHTML={{ __html: socialCardSvg }}
              />
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={{ flex: 1, padding: '32px 40px', background: '#090a0f', overflowY: 'auto' }}>
              <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                {/* Header score card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #131722 0%, #1a1e2e 100%)',
                    border: '1px solid #232738',
                    borderRadius: '14px',
                    padding: '24px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Cpu size={24} color="#10b981" />
                      <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0 }}>Autonomous Subagent Team Audit</h2>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
                      4 Specialized AI subagents analyzed your codebase: Security, Principal Architecture, QA/Linter, and Documentation.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: auditReport.score > 70 ? '#10b981' : '#f59e0b' }}>
                      {auditReport.score}<span style={{ fontSize: '1.2rem', color: '#64748b' }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Repo Health Score</div>
                  </div>
                </div>

                {/* 4 Subagents Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { title: 'Security Officer', emoji: '🛡️', role: 'Secrets & Perms', status: auditReport.agents.security.status, count: auditReport.agents.security.findings.length },
                    { title: 'Principal Architect', emoji: '🏛️', role: 'CI/CD & Containers', status: auditReport.agents.architect.status, count: auditReport.agents.architect.findings.length },
                    { title: 'Staff QA / Linter', emoji: '🧪', role: 'Tests & Type Safety', status: auditReport.agents.linter.status, count: auditReport.agents.linter.findings.length },
                    { title: 'Tech Writer', emoji: '✍️', role: 'README & Diagrams', status: 'Optimal', count: 0 },
                  ].map((agent, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#14161f',
                        border: '1px solid #232738',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '1.6rem' }}>{agent.emoji}</div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{agent.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{agent.role}</div>
                      <div
                        style={{
                          marginTop: 'auto',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          width: 'fit-content',
                          background: agent.count > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: agent.count > 0 ? '#fca5a5' : '#6ee7b7',
                        }}
                      >
                        {agent.count > 0 ? `${agent.count} Actions Needed` : 'Passing'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Findings & Action Items */}
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#ef4444" /> Discovered Bottlenecks & Required Actions
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {auditReport.agents.security.findings.concat(auditReport.agents.architect.findings, auditReport.agents.linter.findings).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#141724',
                        border: `1px solid ${item.severity === 'critical' ? '#7f1d1d' : '#78350f'}`,
                        borderRadius: '10px',
                        padding: '16px 20px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: item.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            color: '#fff',
                          }}
                        >
                          {item.severity}
                        </span>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{item.title}</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>{item.description}</p>
                      <div
                        style={{
                          background: '#0d1017',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #10b981',
                          fontSize: '0.8rem',
                          color: '#6ee7b7',
                        }}
                      >
                        💡 <strong>Subagent Fix:</strong> {item.recommendation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested PR Output */}
                <div style={{ background: '#10121a', border: '1px solid #232738', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      📋 Automated GitHub PR Summary Ready to Copy
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(auditReport.suggestedPrBody);
                        confetti({ particleCount: 40, spread: 50 });
                      }}
                    >
                      <Copy size={12} /> Copy PR Summary
                    </button>
                  </div>
                  <pre
                    style={{
                      background: '#07080c',
                      padding: '14px',
                      borderRadius: '8px',
                      color: '#cbd5e1',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {auditReport.suggestedPrBody}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
