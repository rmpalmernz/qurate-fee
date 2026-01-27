import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';
import QurateLogo from '@/components/QurateLogo';

interface AccessDeniedProps {
  error?: string;
}

/**
 * Access Denied page - uses semantic tokens only, no hardcoded colors
 */
export default function AccessDenied({ error }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-qurate-slate flex flex-col">
      {/* Header */}
      <header className="border-b border-qurate-slate-light/20">
        <div className="container mx-auto px-4 py-5">
          <QurateLogo />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-qurate-slate-light border-qurate-slate-light/30 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-qurate-error/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-qurate-error" />
            </div>
            <CardTitle className="text-qurate-light text-xl">
              Access Denied
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              {error || 'You do not have permission to access this page'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-qurate-muted text-sm">
              This fee calculator is only accessible via a valid client link. 
              If you believe you should have access, please contact your Qurate advisor.
            </p>

            <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
              <p className="text-qurate-muted text-sm mb-2">Need assistance?</p>
              <Button
                asChild
                className="bg-qurate-gold hover:bg-qurate-gold-light text-qurate-slate font-semibold"
              >
                <a href="mailto:info@qurate.com.au">
                  Contact Qurate Advisory
                </a>
              </Button>
            </div>

            <div className="text-qurate-muted text-xs">
              <a 
                href="https://www.qurate.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-qurate-gold hover:underline"
              >
                www.qurate.com.au
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
