// Import the global CSS once at the application root.
import './globals.css';

// Import the Metadata type for typed Next.js page metadata.
import type { Metadata } from 'next';

// Define browser metadata for the assessment.
export const metadata: Metadata = {
  // Title shown in the browser tab.
  title: 'Todo List',

  // Simple description for the page.
  description: 'NestJS GraphQL Todo technical assessment',
};

// RootLayout wraps every page rendered by the Next.js app.
export default function RootLayout({
  // React provides the current page through children.
  children,
}: Readonly<{
  // ReactNode accepts any renderable React content.
  children: React.ReactNode;
}>) {
  // Return the required HTML structure for the App Router.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
