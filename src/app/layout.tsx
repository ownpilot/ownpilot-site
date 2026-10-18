import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { REPO, VERSION } from '@/lib/site';
export const metadata: Metadata = {
  metadataBase: new URL('https://ownpilot.dev'),
  title: {
    default: 'OwnPilot — Your AI. Your infrastructure. Your rules.',
    template: '%s · OwnPilot',
  },
  description:
    'A self-hosted personal AI assistant that connects your models, tools and memory. Build autonomous agents and workflows on infrastructure you control.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'OwnPilot',
    locale: 'en_US',
    url: 'https://ownpilot.dev',
    title: 'OwnPilot — Your AI. Your data. Your rules.',
    description: 'Your models. Your tools. Your data. One self-hosted AI assistant.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'OwnPilot — Your AI. Your data. Your rules.',
      },
    ],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#111415' },
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
  ],
};
const themeScript = `(function(){var t='dark';try{var s=localStorage.getItem('ownpilot-theme');if(s==='light'||s==='dark'||s==='system')t=s;}catch(e){}document.documentElement.dataset.theme=t;document.documentElement.dataset.color=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-color="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Navigation />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'OwnPilot',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Self-hosted · Docker / Node.js',
              url: 'https://ownpilot.dev',
              codeRepository: REPO,
              softwareVersion: VERSION,
              license: `${REPO}/blob/main/LICENSE`,
              description:
                'Self-hosted personal AI assistant platform with agents, tool orchestration, memory and multi-provider support.',
            }),
          }}
        />
      </body>
    </html>
  );
}
