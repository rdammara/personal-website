import type { Metadata } from 'next';
import { Albert_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { site } from '@/lib/site';

// Albert Sans for all reading text; IBM Plex Mono only for data values (dates, timestamps, sources).
const albertSans = Albert_Sans({
  subsets: ['latin'],
  variable: '--font-albert-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${site.name}: data engineer`,
    template: `%s · ${site.name}`,
  },
  description: site.title,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${albertSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-[17px] leading-[1.55] text-ink antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
