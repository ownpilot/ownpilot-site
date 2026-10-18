import type { Metadata } from 'next';

export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  const socialTitle = `${title} · OwnPilot`;
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: 'website',
      siteName: 'OwnPilot',
      locale: 'en_US',
      title: socialTitle,
      description,
      url: pathname,
      images: [
        {
          url: '/social-card.png',
          width: 1200,
          height: 630,
          alt: 'OwnPilot — Your AI. Your infrastructure. Your rules.',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: ['/social-card.png'],
    },
  };
}
