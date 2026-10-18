export const REPO = 'https://github.com/ownpilot/OwnPilot';
export const SITE_REPO = 'https://github.com/ownpilot/ownpilot-site';
export const VERSION = '0.8.3';
export const SOURCE_COMMIT = 'eb4c27f29d4d12778621a83e49cd673cd8b62239';
export const SOURCE = `${REPO}/blob/${SOURCE_COMMIT}`;
export const dockerCommand = `git clone https://github.com/ownpilot/OwnPilot.git ownpilot
cd ownpilot
cp .env.example .env
# Set a strong POSTGRES_PASSWORD in .env before starting.
docker compose --profile postgres up -d --build`;
export const sourceCommand = `git clone https://github.com/ownpilot/OwnPilot.git ownpilot
cd ownpilot
cp .env.example .env
# Set a strong POSTGRES_PASSWORD in .env.
pnpm install
docker compose --profile postgres up -d postgres
pnpm dev`;
export const windowsCommand = `git clone https://github.com/ownpilot/OwnPilot.git ownpilot
cd ownpilot
Copy-Item .env.example .env
# Set a strong POSTGRES_PASSWORD in .env before starting.
docker compose --profile postgres up -d --build`;
export const navLinks = [
  ['Why OwnPilot', '/#features'],
  ['How it works', '/#how-it-works'],
  ['Integrations', '/integrations/'],
  ['Docs', '/docs/getting-started/'],
] as const;
export const faqs = [
  [
    'What exactly is OwnPilot?',
    'OwnPilot is a self-hosted personal AI assistant platform. It connects your choice of AI models to tools, persistent memory, autonomous agents and workflows through a web interface, Telegram or WhatsApp.',
  ],
  [
    'Can I use it with local models?',
    'Yes. OwnPilot supports Ollama, LM Studio, LocalAI and vLLM, alongside cloud providers and other OpenAI-compatible endpoints. Model capabilities and tool-calling support vary; choose a model suited to your tasks.',
  ],
  [
    'Does self-hosted mean my data never leaves my machine?',
    'Your application and database run on infrastructure you control. Requests to cloud AI providers, connected apps and external tools can send data to those services. Use a local model and review your enabled integrations when you need a local inference workflow.',
  ],
  [
    'What do I need to get started?',
    'For the Docker path, install Git and Docker with Compose. Clone the repository, copy .env.example to .env, set a strong database password and start the postgres profile. Open localhost:8080 and configure a provider in Settings → Config Center. Source development requires Node.js 22+, pnpm 10+ and PostgreSQL 16+.',
  ],
  [
    'Can agents act without my approval?',
    'OwnPilot offers configurable autonomy levels, tool policies, approval requirements and budgets. Claw agents can run a single task, continuously, on an interval or in response to events. Review the permissions and limits for each agent before enabling autonomous execution.',
  ],
  [
    'Is OwnPilot free to use?',
    'OwnPilot is open source under the MIT license, including for commercial use. Your hosting, paid model APIs and third-party services may have their own costs. OwnPilot does not include free access to those services.',
  ],
  [
    'Can I connect my own tools?',
    'Yes. Connect external MCP servers, install skills in the SKILL.md format, add extension bundles or register CLI tools. OwnPilot also exposes its own tools through an MCP server endpoint. Review permissions before installing third-party tools.',
  ],
  [
    'How can I contribute?',
    'Read CONTRIBUTING.md in the product repository, check the open issues and propose a focused change. Bug reports, documentation improvements, extensions and pull requests are welcome. Website contributions belong in ownpilot/ownpilot-site.',
  ],
];
