import { forwardRef, ReactNode } from 'react';
import QurateLogo from '@/components/QurateLogo';

interface PageShellProps {
  children: ReactNode;
}

/**
 * Canonical Page Shell - provides consistent structural framing
 * Owns: background color, horizontal padding, vertical rhythm, content width
 * Does NOT own: business logic, visual styling of children
 */
const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className="min-h-screen bg-qurate-slate flex flex-col">
        {/* Header */}
        <header className="border-b border-qurate-slate-light/20">
          <div className="container mx-auto px-4 py-5 flex items-center justify-between">
            <QurateLogo />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 pb-8 max-w-4xl text-center text-qurate-muted text-sm space-y-2">
          <p>This is an estimate only. Final fees may vary based on engagement terms.</p>
          <p>
            Contact us at{' '}
            <a href="mailto:info@qurate.com.au" className="text-qurate-gold hover:underline">
              info@qurate.com.au
            </a>
          </p>
          <p className="pt-4">
            <a href="https://www.qurate.com.au" target="_blank" rel="noopener noreferrer" className="text-qurate-gold hover:underline">
              www.qurate.com.au
            </a>
          </p>
        </footer>
      </div>
    );
  }
);

PageShell.displayName = 'PageShell';

export default PageShell;
