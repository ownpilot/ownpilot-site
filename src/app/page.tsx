import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Box,
  BrainCircuit,
  Check,
  Code2,
  Database,
  LockKeyhole,
  MessageSquare,
  Orbit,
  Plug,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Github } from '@/components/github-icon';
import { HeroSystem, ArchitectureDiagram } from '@/components/hero-system';
import { HeroBackground } from '@/components/hero-background';
import { ProductPreview } from '@/components/product-preview';
import { Quickstart } from '@/components/quickstart';
import { REPO, VERSION, faqs } from '@/lib/site';
const features = [
  {
    n: '01',
    icon: Bot,
    title: 'A crew that gets you.',
    description:
      'Give agents a purpose, a personality, and a place to work. Run a focused task or build a crew that collaborates.',
    href: '/docs/agents/',
    label: 'Meet your agents',
    className: 'feature-agents',
  },
  {
    n: '02',
    icon: BrainCircuit,
    title: 'Context that sticks.',
    description:
      'Notes, goals, preferences, and persistent memory. Your assistant can pick up the thread instead of starting over.',
    href: '/docs/personal-data/',
    label: 'Explore personal memory',
    className: 'feature-memory',
  },
  {
    n: '03',
    icon: Workflow,
    title: 'Make “every day” effortless.',
    description:
      'Connect tools in visual workflows. Set schedules, react to events, and turn recurring work into a routine.',
    href: '/docs/workflows/',
    label: 'Build a workflow',
    className: 'feature-workflows',
  },
  {
    n: '04',
    icon: Plug,
    title: 'The tools are already here.',
    description:
      'Search the web, work with files, run code, or connect an MCP server. Extend your assistant with skills and your own tools.',
    href: '/docs/tools/',
    label: 'Open the toolbox',
    className: 'feature-tools',
  },
  {
    n: '05',
    icon: MessageSquare,
    title: 'Good company. Anywhere.',
    description:
      'Start in the web UI. Keep the conversation going on Telegram or WhatsApp. Add voice when typing can wait.',
    href: '/docs/channels/',
    label: 'Connect your channels',
    className: 'feature-channels',
  },
  {
    n: '06',
    icon: ShieldCheck,
    title: 'You hold the controls.',
    description:
      'Your deployment, your model, your permissions. Set approval requirements and boundaries for what your agents can do.',
    href: '/docs/security/',
    label: 'Understand the boundaries',
    className: 'feature-security',
  },
];
export default function Home() {
  return (
    <main id="main">
      <section className="hero-stage" aria-labelledby="hero-title">
        <HeroBackground />
        <div className="hero container">
          <div className="hero-copy">
            <Link className="release-pill" href="/changelog/">
              <span className="status-dot" />
              <span>v{VERSION}</span>
              <span className="pill-divider" />A little more autonomous.
              <ArrowRight size={13} />
            </Link>
            <div className="eyebrow hero-eyebrow">
              <span className="eyebrow-line" />
              THE PERSONAL AI, ACTUALLY PERSONAL.
            </div>
            <h1 id="hero-title">
              Your AI.
              <br />
              Your world.
              <br />
              <span>Your rules.</span>
            </h1>
            <p className="hero-description">
              An assistant that connects your models, tools, and memory. Runs on your
              infrastructure. And works on your terms.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/docs/getting-started/">
                Make it yours
                <ArrowRight size={17} />
              </Link>
              <a className="button button-secondary" href={REPO} target="_blank" rel="noreferrer">
                <Github size={17} />
                Explore the source
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={12} />
                Self-hosted
              </span>
              <span>
                <Check size={12} />
                MIT licensed
              </span>
              <span>
                <Check size={12} />
                Cloud or local AI
              </span>
            </div>
          </div>
          <HeroSystem />
        </div>
      </section>
      <div className="provider-strip container">
        <span className="tiny-label">
          YOUR INTELLIGENCE.
          <br />
          YOUR CHOICE.
        </span>
        <div className="provider-wordmarks">
          <span className="provider-openai">
            ◎ <b>OpenAI</b>
          </span>
          <span className="provider-anthropic">Anthropic</span>
          <span className="provider-gemini">✦ Gemini</span>
          <span className="provider-ollama">◉ ollama</span>
          <span className="provider-openrouter">↗ OpenRouter</span>
        </div>
        <Link href="/integrations/">
          And your favorite.
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <section className="section container" id="features">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="section-index">01 /</span> BUILT AROUND YOUR EVERYDAY
            </span>
            <h2>
              Less prompting.
              <br />
              <span className="text-muted">More getting things done.</span>
            </h2>
          </div>
          <p>
            You don’t need another chat window.
            <br />
            You need an assistant with context,
            <br />
            capability, and a little initiative.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <article key={f.n} className={`feature-card ${f.className}`}>
              <div className="feature-card-top">
                <span className="feature-icon">
                  <f.icon size={23} strokeWidth={1.5} />
                </span>
                <span className="tiny-label">{f.n} /</span>
              </div>
              {f.n === '01' && (
                <div className="feature-mini-crew" aria-hidden="true">
                  <span>✦</span>
                  <span>⌘</span>
                  <span>◈</span>
                  <i />
                  <small>A LITTLE TEAM. A LOT OF POSSIBILITY.</small>
                </div>
              )}
              {f.n === '02' && (
                <div className="memory-fragments" aria-hidden="true">
                  <span>“Keep it concise.”</span>
                  <span>Your weekly goals ↗</span>
                  <span>Project context, remembered.</span>
                </div>
              )}
              {f.n === '03' && (
                <div className="workflow-mini" aria-hidden="true">
                  <span>
                    <Radar size={15} />
                  </span>
                  <i />
                  <span>
                    <Sparkles size={15} />
                  </span>
                  <i />
                  <span>
                    <Check size={15} />
                  </span>
                  <small>TRIGGER → THINK → DO</small>
                </div>
              )}
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              <Link href={f.href}>
                {f.label}
                <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section product-section" id="workspace">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="section-index">02 /</span> A HOME FOR THE WHOLE PICTURE
              </span>
              <h2>
                Meet your new
                <br />
                <span className="text-muted">command center.</span>
              </h2>
            </div>
            <div>
              <p>
                Conversations, agents, memory, and workflows.
                <br />
                Connected in one thoughtful workspace.
              </p>
              <Link className="text-link" href="/docs/agents/">
                Take a closer look
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>
      <section className="section container how-section" id="how-it-works">
        <div className="how-copy">
          <span className="eyebrow">
            <span className="section-index">03 /</span> CONNECTED BY DESIGN
          </span>
          <h2>
            Many moving parts.
            <br />
            <span className="text-muted">One clear direction.</span>
          </h2>
          <p className="section-description">
            OwnPilot brings your AI stack together. You choose what connects, what runs, and how
            much freedom it gets.
          </p>
          <ol className="how-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Choose your intelligence.</h3>
                <p>
                  Connect a cloud provider or a local model. Switch without rebuilding your
                  workflow.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Give it the right context.</h3>
                <p>
                  Connect tools, memories, and instructions. Your assistant has something useful to
                  work with.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Set the boundaries. Let it work.</h3>
                <p>
                  Start a conversation, schedule an agent, or run a workflow. Stay in control of the
                  next step.
                </p>
              </div>
            </li>
          </ol>
          <Link href="/docs/architecture/" className="text-link">
            Explore the architecture
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <ArchitectureDiagram />
      </section>
      <section className="ownership-section">
        <div className="container ownership-grid">
          <div>
            <div className="eyebrow">
              <LockKeyhole size={13} /> OWN YOUR ASSISTANT. REALLY.
            </div>
            <h2>
              Intelligence shouldn’t
              <br />
              come with a landlord.
            </h2>
            <p>
              Run OwnPilot where you want. Keep your application data on your infrastructure. Choose
              the models and services you trust.
            </p>
            <Link href="/docs/security/" className="text-link">
              A clear look at privacy & security
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="ownership-points">
            <div>
              <Database size={23} />
              <span>
                <strong>Your infrastructure.</strong>
                <p>Self-host the gateway and PostgreSQL database.</p>
              </span>
            </div>
            <div>
              <ShieldCheck size={23} />
              <span>
                <strong>Your boundaries.</strong>
                <p>Configure tool approvals, autonomy, and budgets.</p>
              </span>
            </div>
            <div>
              <Code2 size={23} />
              <span>
                <strong>Your freedom to build.</strong>
                <p>Inspect, extend, and contribute under the MIT license.</p>
              </span>
            </div>
            <small>
              Cloud providers and connected tools may receive data when used. Local inference and
              self-hosting give you choices; review each connection.
            </small>
          </div>
        </div>
      </section>
      <section className="section container usecases-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="section-index">04 /</span> START WITH SOMETHING USEFUL
            </span>
            <h2>
              A little help.
              <br />
              <span className="text-muted">A lot of room to explore.</span>
            </h2>
          </div>
          <p>
            Give it a job that matters to you.
            <br />
            Build from there.
          </p>
        </div>
        <div className="usecases-grid">
          <Link href="/docs/workflows/" className="usecase">
            <span className="usecase-number">01 / THE MORNING PERSON</span>
            <div className="usecase-visual morning-visual" aria-hidden="true">
              <div className="morning-sun" />
              <span>09:00</span>
              <small>A CLEARER START.</small>
            </div>
            <h3>
              Your day, already in focus.
              <ArrowUpRight size={20} />
            </h3>
            <p>
              Bring together your calendar, tasks, and a short briefing. Deliver it to the channel
              you actually check.
            </p>
            <span className="usecase-tags">
              SCHEDULES<span>·</span>PERSONAL DATA<span>·</span>CHANNELS
            </span>
          </Link>
          <Link href="/docs/agents/" className="usecase">
            <span className="usecase-number">02 / THE CURIOUS MIND</span>
            <div className="usecase-visual research-visual" aria-hidden="true">
              <div>
                <span>↗</span>Follow the sources.
              </div>
              <div>
                <span>◈</span>Connect the dots.
              </div>
              <div>
                <span>✓</span>Keep the useful bits.
              </div>
            </div>
            <h3>
              Turn curiosity into clarity.
              <ArrowUpRight size={20} />
            </h3>
            <p>
              Ask a research agent to explore a topic, gather sources, and save a summary as a
              versioned artifact.
            </p>
            <span className="usecase-tags">
              BROWSER<span>·</span>AGENTS<span>·</span>ARTIFACTS
            </span>
          </Link>
          <Link href="/docs/agents/" className="usecase">
            <span className="usecase-number">03 / THE BUILDER</span>
            <div className="usecase-visual code-visual" aria-hidden="true">
              <code>
                <span>+ </span>a fresh perspective
                <br />
                <span>+ </span>a second pair of eyes
                <br />
                <i>↳ ready for your review</i>
              </code>
            </div>
            <h3>
              Your next coding companion.
              <ArrowUpRight size={20} />
            </h3>
            <p>
              Coordinate coding CLIs, follow terminal output, and let an agent help investigate or
              review a change.
            </p>
            <span className="usecase-tags">
              CODING AGENTS<span>·</span>CLI<span>·</span>WORKSPACES
            </span>
          </Link>
        </div>
        <p className="usecase-note">
          Example workflows. Configure the required models, tools, accounts, and permissions in your
          instance.
        </p>
      </section>
      <section className="section container quickstart-section" id="quickstart">
        <div>
          <span className="eyebrow">
            <span className="section-index">05 /</span> YOUR NEXT GOOD DECISION
          </span>
          <h2>
            A few commands.
            <br />
            <span className="text-muted">A world of your own.</span>
          </h2>
          <p className="section-description">
            Bring Git and Docker. We’ll bring the assistant.
            <br />
            Clone, configure, and make yourself at home.
          </p>
          <div className="setup-requirements">
            <span>
              <Box size={14} />
              Docker + Compose
            </span>
            <span>
              <Github size={14} />
              Git
            </span>
          </div>
          <p className="setup-important">
            Copy the environment template and set a strong database password before starting.
            Configure your AI provider in Config Center after launch.
          </p>
          <Link href="/docs/installation/" className="text-link">
            All installation options
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <Quickstart />
      </section>
      <section className="section container faq-section">
        <div>
          <span className="eyebrow">A FEW THINGS, CLEARED UP.</span>
          <h2>
            Good questions.
            <br />
            <span className="text-muted">Straight answers.</span>
          </h2>
          <p>Still curious about something?</p>
          <a className="text-link" href={`${REPO}/issues`} target="_blank" rel="noreferrer">
            Let’s talk on GitHub
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <details className="faq-item" key={q}>
              <summary>
                <span className="faq-number">0{i + 1}</span>
                <h3>{q}</h3>
                <PlusIcon />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta container">
        <div className="cta-orbit" aria-hidden="true">
          <Orbit size={100} strokeWidth={0.5} />
        </div>
        <span className="eyebrow">LESS DEPENDENCE. MORE POSSIBILITY.</span>
        <h2>
          Put yourself
          <br />
          in the pilot’s seat<span>.</span>
        </h2>
        <p>Your models. Your tools. Your next great idea.</p>
        <div>
          <Link className="button button-primary" href="/docs/getting-started/">
            Let’s make it yours
            <ArrowRight size={17} />
          </Link>
          <a className="text-link" href={REPO} target="_blank" rel="noreferrer">
            <Github size={17} />
            Build with us
            <ArrowUpRight size={14} />
          </a>
        </div>
        <span className="tiny-label cta-footnote">
          OPEN SOURCE. SELF-HOSTED. ENTIRELY UP TO YOU.
        </span>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(([name, text]) => ({
              '@type': 'Question',
              name,
              acceptedAnswer: { '@type': 'Answer', text },
            })),
          }),
        }}
      />
    </main>
  );
}
function PlusIcon() {
  return (
    <svg
      className="faq-plus"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 9h12M9 3v12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
