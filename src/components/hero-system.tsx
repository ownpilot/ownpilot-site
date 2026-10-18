'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Code2,
  Database,
  Fingerprint,
  Globe2,
  ListChecks,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
const scenarios = [
  {
    name: 'Daily briefing',
    request: 'Get my day off to a good start.',
    agent: 'Morning briefer',
    tool: 'Calendar + tasks',
    output: 'Your day, in focus.',
    icon: ListChecks,
  },
  {
    name: 'Research',
    request: 'Turn a topic into a useful brief.',
    agent: 'Research agent',
    tool: 'Search + browser',
    output: 'Sources. Summary. Done.',
    icon: Search,
  },
  {
    name: 'Code review',
    request: 'Give this change a second look.',
    agent: 'Code reviewer',
    tool: 'Git + coding CLI',
    output: 'A review you can act on.',
    icon: Code2,
  },
];
export function HeroSystem() {
  const [selected, setSelected] = useState(0);
  const scenario = scenarios[selected];
  return (
    <div className="hero-system">
      <div className="system-topline">
        <span>
          <span className="status-dot" /> YOUR OWN INTELLIGENCE LAYER
        </span>
        <span>01 — 03</span>
      </div>
      <div
        className="orbit-scene"
        role="img"
        aria-label={`${scenario.request} flows through the OwnPilot gateway, ${scenario.agent}, your chosen model, ${scenario.tool} and persistent memory to produce ${scenario.output}`}
      >
        <div className="orbit-grid" />
        <svg className="orbit-lines" viewBox="0 0 620 470" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="wire">
              <stop stopColor="currentColor" stopOpacity=".12" />
              <stop offset=".5" stopColor="var(--accent)" stopOpacity=".8" />
              <stop offset="1" stopColor="currentColor" stopOpacity=".12" />
            </linearGradient>
          </defs>
          <ellipse
            cx="310"
            cy="241"
            rx="184"
            ry="151"
            stroke="currentColor"
            strokeOpacity=".08"
            strokeDasharray="3 7"
          />
          <ellipse cx="310" cy="241" rx="126" ry="110" stroke="currentColor" strokeOpacity=".1" />
          <path
            className="signal-line"
            d="M310 80v88M145 143h85l45 56M478 152h-85l-45 49M145 324h80l52-55M487 322h-91l-48-53M310 305v94"
            stroke="url(#wire)"
            strokeWidth="1.5"
          />
          <circle className="signal-dot" cx="310" cy="119" r="3" fill="var(--accent)" />
          <circle cx="226" cy="324" r="3" fill="var(--green)" />
          <circle cx="394" cy="152" r="3" fill="var(--accent)" />
          <path
            d="M29 25h14M36 18v14M577 416h14M584 409v14"
            stroke="currentColor"
            strokeOpacity=".25"
          />
        </svg>
        <div className="request-node">
          <span className="tiny-label">
            <Sparkles size={11} /> YOU SET THE DIRECTION
          </span>
          <span>{scenario.request}</span>
        </div>
        <div className="system-core">
          <div className="core-ring" />
          <img src="/logo-mark.svg" width="68" height="77" alt="" />
          <strong>OwnPilot</strong>
          <span>YOUR GATEWAY</span>
        </div>
        <div className="orbit-node node-agent">
          <span className="node-icon teal">
            <Fingerprint size={20} />
          </span>
          <span>
            <small>YOUR AGENT</small>
            <strong>{scenario.agent}</strong>
          </span>
          <span className="node-light" />
        </div>
        <div className="orbit-node node-model">
          <span className="node-icon blue">
            <Sparkles size={20} />
          </span>
          <span>
            <small>YOUR MODEL</small>
            <strong>Cloud or local</strong>
          </span>
          <ArrowUpRight size={12} />
        </div>
        <div className="orbit-node node-memory">
          <span className="node-icon blue">
            <Database size={20} />
          </span>
          <span>
            <small>YOUR CONTEXT</small>
            <strong>Persistent memory</strong>
          </span>
        </div>
        <div className="orbit-node node-tools">
          <span className="node-icon green">
            <Workflow size={20} />
          </span>
          <span>
            <small>YOUR TOOLS</small>
            <strong>{scenario.tool}</strong>
          </span>
        </div>
        <div className="output-node">
          <span className="output-check">
            <Check size={14} />
          </span>
          <span>{scenario.output}</span>
          <span className="tiny-label">OUTPUT</span>
        </div>
        <div className="local-boundary">
          <ShieldCheck size={11} />
          <span>SELF-HOSTED CORE</span>
        </div>
      </div>
      <div className="scenario-tabs" role="group" aria-label="Explore example workflows">
        {scenarios.map((s, i) => (
          <button key={s.name} aria-pressed={i === selected} onClick={() => setSelected(i)}>
            <s.icon size={13} />
            {s.name}
          </button>
        ))}
      </div>
      <div className="system-footnote">
        <Radio size={11} />
        <span>One connected system. You’re in the pilot’s seat.</span>
        <span>ILLUSTRATED FLOW</span>
      </div>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="architecture-visual">
      <div className="architecture-inputs">
        <span>
          <Globe2 size={17} />
          Web UI
        </span>
        <span>➤ Telegram</span>
        <span>◉ WhatsApp</span>
        <span>⌁ MCP clients</span>
      </div>
      <svg viewBox="0 0 600 60" className="architecture-connectors" aria-hidden="true">
        <path
          d="M65 0v20h470V0M220 0v20m160-20v20M300 20v40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="300" cy="45" r="3" fill="var(--accent)" />
      </svg>
      <div className="architecture-gateway">
        <div className="architecture-gateway-heading">
          <img src="/logo-mark.svg" width="33" height="37" alt="" />
          <div>
            <strong>OwnPilot gateway</strong>
            <small>Hono · HTTP / SSE / WebSocket</small>
          </div>
          <span className="tiny-label">:8080</span>
        </div>
        <div className="architecture-engine">
          <span>Agent engine</span>
          <span>Provider router</span>
          <span>Tool orchestration</span>
          <span>EventBus</span>
        </div>
      </div>
      <div className="architecture-branches">
        <div>
          <Sparkles size={19} />
          <strong>Your models</strong>
          <span>Cloud APIs · local inference</span>
        </div>
        <div>
          <Workflow size={19} />
          <strong>Your tools</strong>
          <span>Built-in · MCP · extensions</span>
        </div>
        <div>
          <Database size={19} />
          <strong>Your data</strong>
          <span>PostgreSQL · memory</span>
        </div>
      </div>
      <p>
        <ShieldCheck size={13} />
        Run the gateway and database on your infrastructure. External services follow your
        configuration.
      </p>
    </div>
  );
}
