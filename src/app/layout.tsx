import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ContextLinc - Next-Generation Context Engineering',
  description: 'Transform AI agents from simple chatbots into sophisticated systems through advanced context engineering',
  keywords: ['AI', 'Context Engineering', 'Machine Learning', 'Chatbot', 'BRAINSAIT'],
  authors: [{ name: 'Dr. Mohamed El Fadil', url: 'https://thefadil.site' }],
  creator: 'BRAINSAIT LTD',
  publisher: 'BRAINSAIT LTD',
  metadataBase: new URL('https://context.thefadil.site'),
  openGraph: {
    title: 'ContextLinc - Next-Generation Context Engineering',
    description: 'Transform AI agents through advanced context engineering',
    url: 'https://context.thefadil.site',
    siteName: 'ContextLinc',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ContextLinc Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContextLinc - Next-Generation Context Engineering',
    description: 'Transform AI agents through advanced context engineering',
    images: ['/og-image.png'],
    creator: '@brainsait369',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
          {children}
        </div>
      </body>
    </html>
  );
}