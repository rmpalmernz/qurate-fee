import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

interface AccessDeniedProps {
  error?: string;
}

export default function AccessDenied({ error }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-qurate-slate flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-qurate-slate-light border-qurate-slate-light/30 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
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
            <p>Qurate Advisory</p>
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
    </div>
  );
}
