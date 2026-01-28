import { useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateToken } from '@/lib/tokenUtils';
import { toast } from 'sonner';
import { Copy, Link, Check } from 'lucide-react';

export default function AdminGenerateLink() {
  const [clientName, setClientName] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const days = parseInt(validityDays, 10);
    const token = generateToken(days);
    const fullUrl = `${window.location.origin}/calculator?token=${token}`;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    
    setGeneratedLink(fullUrl);
    setExpiryDate(expiry);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card className="bg-qurate-slate-light/50 border-qurate-slate-light/30">
          <CardHeader>
            <CardTitle className="text-qurate-beige flex items-center gap-2">
              <Link className="h-5 w-5 text-qurate-gold" />
              Generate Client Link
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              Create a time-limited access link for the fee calculator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Name Input */}
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-qurate-beige">
                Client Name <span className="text-qurate-muted">(optional)</span>
              </Label>
              <Input
                id="clientName"
                placeholder="e.g. Smith Industries"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-qurate-slate border-qurate-slate-light/30 text-qurate-beige placeholder:text-qurate-muted"
              />
            </div>

            {/* Validity Period */}
            <div className="space-y-3">
              <Label className="text-qurate-beige">Link Validity</Label>
              <RadioGroup
                value={validityDays}
                onValueChange={setValidityDays}
                className="flex flex-col space-y-2"
              >
                {[
                  { value: '7', label: '7 days' },
                  { value: '30', label: '30 days' },
                  { value: '90', label: '90 days' },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={option.value}
                      id={`validity-${option.value}`}
                      className="border-qurate-gold text-qurate-gold"
                    />
                    <Label
                      htmlFor={`validity-${option.value}`}
                      className="text-qurate-beige cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full bg-qurate-gold hover:bg-qurate-gold/90 text-qurate-slate font-semibold"
            >
              Generate Link
            </Button>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="space-y-4 pt-4 border-t border-qurate-slate-light/30">
                <div className="space-y-2">
                  <Label className="text-qurate-beige">Generated Link</Label>
                  <div className="p-3 bg-qurate-slate rounded-md border border-qurate-slate-light/30 break-all">
                    <code className="text-sm text-qurate-gold">{generatedLink}</code>
                  </div>
                </div>

                {expiryDate && (
                  <p className="text-sm text-qurate-muted">
                    Expires: <span className="text-qurate-beige">{formatDate(expiryDate)}</span>
                  </p>
                )}

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full border-qurate-gold text-qurate-gold hover:bg-qurate-gold/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
