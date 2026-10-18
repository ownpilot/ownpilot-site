'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Files,
  Fingerprint,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Radio,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
const panels = [
  {
    name: 'Autonomous hub',
    icon: LayoutDashboard,
    title: 'A small crew. A clear mission.',
    subtitle: 'Give every agent a purpose, a workspace, and boundaries.',
    agents: [
      ['Morning briefer', 'A calmer start to your day.', 'Scheduled', 'violet'],
      ['Research assistant', 'Follow the sources. Find the signal.', 'Ready', 'orange'],
      ['Code reviewer', 'A fresh pair of eyes on your work.', 'Ready', 'blue'],
    ],
  },
  {
    name: 'Personal memory',
    icon: Fingerprint,
    title: 'Good context goes a long way.',
    subtitle: 'Keep the facts, preferences, and goals that matter.',
    agents: [
      ['Preferences', 'I prefer concise, source-backed summaries.', 'Preference', 'violet'],
      ['Project context', 'OwnPilot website · launch checklist', 'Project', 'orange'],
      ['Weekly focus', 'Ship the documentation improvements.', 'Goal', 'blue'],
    ],
  },
  {
    name: 'Workflows',
    icon: Workflow,
    title: 'Make the repeatable, automatic.',
    subtitle: 'Connect a trigger, the right tools, and a useful outcome.',
    agents: [
      ['Weekday briefing', 'Schedule → calendar → summary', 'Scheduled', 'violet'],
      ['Research pipeline', 'Topic → sources → saved artifact', 'Ready', 'orange'],
      ['Review a change', 'Git diff → coding agent → report', 'Ready', 'blue'],
    ],
  },
];
export function ProductPreview() {
  const [active, setActive] = useState(0);
  const panel = panels[active];
  return (
    <div className="product-demo">
      <div className="product-windowbar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>
          <ShieldCheck size={11} />
          localhost:8080
        </span>
        <span className="demo-badge">INTERFACE WALKTHROUGH</span>
      </div>
      <div className="product-shell">
        <aside className="product-sidebar">
          <div className="product-sidebar-brand">
            <img src="/logo-mark.svg" width="24" height="27" alt="" />
            OwnPilot
            <ChevronDown size={12} />
          </div>
          <div className="product-sidebar-label">WORKSPACE</div>
          <div role="tablist" aria-label="Product walkthrough">
            {panels.map((p, i) => (
              <button
                id={`product-tab-${i}`}
                role="tab"
                aria-selected={i === active}
                aria-controls="product-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (
                    ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(
                      e.key,
                    )
                  ) {
                    e.preventDefault();
                    const next =
                      e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? 2
                          : (i + (['ArrowUp', 'ArrowLeft'].includes(e.key) ? 2 : 1)) % 3;
                    setActive(next);
                    document.getElementById(`product-tab-${next}`)?.focus();
                  }
                }}
                key={p.name}
              >
                <p.icon size={15} />
                <span>{p.name}</span>
                {i === 0 && <small>3</small>}
              </button>
            ))}
          </div>
          <div className="sidebar-decoration">
            <span>
              <MessageSquare size={15} /> Chat
            </span>
            <span>
              <Files size={15} /> Artifacts
            </span>
            <span>
              <FolderOpen size={15} /> Personal data
            </span>
          </div>
          <div className="sidebar-bottom">
            <span className="status-dot" />
            Your instance<span>Local</span>
          </div>
        </aside>
        <div
          className="product-main"
          id="product-panel"
          role="tabpanel"
          aria-labelledby={`product-tab-${active}`}
        >
          <div className="product-breadcrumb">
            Workspace <span>/</span> <strong>{panel.name}</strong>
            <MoreHorizontal size={18} />
          </div>
          <div className="product-title">
            <div>
              <span className="tiny-label">YOUR SPACE TO GET THINGS DONE</span>
              <h3>{panel.title}</h3>
              <p>{panel.subtitle}</p>
            </div>
            <span className="demo-action">
              <Plus size={13} />
              Your agents
            </span>
          </div>
          <div className="product-stats">
            <span>
              <i className="status-dot" />
              Your infrastructure
            </span>
            <span>
              <ShieldCheck size={12} />
              Your permissions
            </span>
            <span>
              <Sparkles size={12} />
              Your choice of model
            </span>
          </div>
          <div className="agent-cards">
            {panel.agents.map(([name, desc, status, color], i) => (
              <div className="agent-card" key={name}>
                <div className="agent-card-top">
                  <span className={`agent-avatar ${color}`}>
                    {i === 0 ? (
                      <Bot size={21} />
                    ) : i === 1 ? (
                      <Sparkles size={21} />
                    ) : (
                      <Workflow size={21} />
                    )}
                  </span>
                  <span className="agent-status">
                    <Circle size={5} fill="currentColor" />
                    {status}
                  </span>
                </div>
                <h4>{name}</h4>
                <p>{desc}</p>
                <div className="agent-card-footer">
                  <span>
                    {i === 0 ? <Clock3 size={11} /> : <ShieldCheck size={11} />}{' '}
                    {i === 0 ? 'On your schedule' : 'Within your boundaries'}
                  </span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            ))}
          </div>
          <div className="activity-preview">
            <div>
              <Radio size={13} />
              <strong>A workflow, in plain sight.</strong>
              <span>ILLUSTRATIVE EXAMPLE</span>
            </div>
            <ol>
              <li>
                <span className="activity-check">
                  <Check size={11} />
                </span>
                <strong>Review the day’s context</strong>
                <span>Calendar & tasks</span>
              </li>
              <li>
                <span className="activity-check">
                  <Check size={11} />
                </span>
                <strong>Prepare a focused briefing</strong>
                <span>Your chosen model</span>
              </li>
              <li>
                <span className="activity-check">
                  <Check size={11} />
                </span>
                <strong>Deliver it where you work</strong>
                <span>
                  <Send size={10} />
                  Telegram
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      <div className="product-caption">
        <span>
          <span className="status-dot" />
          ONE PLACE. ALL THE MOVING PARTS.
        </span>
        <span>Illustrated from the product’s documented features. Sample content.</span>
      </div>
    </div>
  );
}
