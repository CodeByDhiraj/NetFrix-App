import type { Metadata } from 'next';
import './globals.css';
import { SessionProviderWrapper } from './providers/SessionProviderWrapper';
import { Toaster } from 'react-hot-toast'


export const metadata: Metadata = {
  title: 'NetFrix - Watch Movies & Series Online Free',
  description: 'Created with Code With Dhiraj',
  generator: 'Code With Dhiraj',
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
