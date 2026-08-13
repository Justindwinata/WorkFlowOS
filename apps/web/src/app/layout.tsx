import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
