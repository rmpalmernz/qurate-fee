import { useState, useId } from 'react';
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

  // Unique IDs for accessibility
  const clientNameId = useId();
  const validityGroupId = useId();
  const generatedLinkId = useId();

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
      <main className="container mx-auto px-4 py-8 max-w-xl" role="main" aria-labelledby="page-title">
        <Card className="bg-qurate-slate-light/50 border-qurate-slate-light/30">
          <CardHeader>
            <CardTitle id="page-title" className="text-qurate-beige flex items-center gap-2">
              <Link className="h-5 w-5 text-qurate-gold" aria-hidden="true" />
              Generate Client Link
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              Create a time-limited access link for the fee calculator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}
              className="space-y-6"
              aria-describedby="form-description"
            >
              <span id="form-description" className="sr-only">
                Fill out the form to generate a time-limited access link for clients
              </span>

              {/* Client Name Input */}
              <div className="space-y-2">
                <Label htmlFor={clientNameId} className="text-qurate-beige">
                  Client Name <span className="text-qurate-muted">(optional)</span>
                </Label>
                <Input
                  id={clientNameId}
                  placeholder="e.g. Smith Industries"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-qurate-slate border-qurate-slate-light/30 text-qurate-beige placeholder:text-qurate-muted"
                  aria-describedby={`${clientNameId}-help`}
                />
                <p id={`${clientNameId}-help`} className="sr-only">
                  Optional field for your reference to identify the client
                </p>
              </div>

              {/* Validity Period */}
              <fieldset className="space-y-3">
                <legend className="text-qurate-beige text-sm font-medium">Link Validity</legend>
                <RadioGroup
                  value={validityDays}
                  onValueChange={setValidityDays}
                  className="flex flex-col space-y-2"
                  aria-label="Select link validity period"
                >
                  {[
                    { value: '7', label: '7 days' },
                    { value: '30', label: '30 days' },
                    { value: '90', label: '90 days' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={option.value}
                        id={`${validityGroupId}-${option.value}`}
                        className="border-qurate-gold text-qurate-gold"
                      />
                      <Label
                        htmlFor={`${validityGroupId}-${option.value}`}
                        className="text-qurate-beige cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>

              {/* Generate Button */}
              <Button
                type="submit"
                className="w-full bg-qurate-gold hover:bg-qurate-gold/90 text-qurate-slate font-semibold"
              >
                Generate Link
              </Button>
            </form>

            {/* Generated Link Display */}
            {generatedLink && (
              <div 
                className="space-y-4 pt-6 mt-6 border-t border-qurate-slate-light/30"
                role="region"
                aria-label="Generated link details"
                aria-live="polite"
              >
                <div className="space-y-2">
                  <Label htmlFor={generatedLinkId} className="text-qurate-beige">Generated Link</Label>
                  <div 
                    id={generatedLinkId}
                    className="p-3 bg-qurate-slate rounded-md border border-qurate-slate-light/30 break-all"
                    role="textbox"
                    aria-readonly="true"
                    tabIndex={0}
                  >
                    <code className="text-sm text-qurate-gold">{generatedLink}</code>
                  </div>
                </div>

                {expiryDate && (
                  <p className="text-sm text-qurate-muted">
                    Expires: <time dateTime={expiryDate.toISOString()} className="text-qurate-beige">{formatDate(expiryDate)}</time>
                  </p>
                )}

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full border-qurate-gold text-qurate-gold hover:bg-qurate-gold/10"
                  aria-label={copied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}