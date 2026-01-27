import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateToken } from '@/lib/tokenUtils';
import { calculateFees, formatCurrency, parseCurrencyInput, FEE_REFERENCE_TABLE } from '@/lib/feeCalculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import QurateLogo from '@/components/QurateLogo';
import AccessDenied from './AccessDenied';

export default function Calculator() {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [enterpriseValue, setEnterpriseValue] = useState(0);

  // Validate token on mount (bypass in dev mode with ?dev=true)
  useEffect(() => {
    const token = searchParams.get('token');
    const devMode = searchParams.get('dev') === 'true';
    
    // Allow access in dev mode without token
    if (devMode) {
      setIsValidating(false);
      return;
    }
    
    const result = validateToken(token);
    
    if (!result.valid) {
      setTokenError(result.error || 'Invalid access');
    }
    setIsValidating(false);
  }, [searchParams]);

  // Calculate fees when enterprise value changes
  const feeResult = useMemo(() => {
    if (enterpriseValue < 5_000_000) return null;
    return calculateFees(enterpriseValue);
  }, [enterpriseValue]);

  // Handle input formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    const numericValue = parseCurrencyInput(rawValue);
    setEnterpriseValue(numericValue);
  };

  const handleInputBlur = () => {
    if (enterpriseValue > 0) {
      setInputValue(formatCurrency(enterpriseValue).replace('A$', ''));
    }
  };

  const handleInputFocus = () => {
    if (enterpriseValue > 0) {
      setInputValue(enterpriseValue.toString());
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-qurate-slate flex items-center justify-center">
        <div className="text-qurate-light animate-pulse">Validating access...</div>
      </div>
    );
  }

  if (tokenError) {
    return <AccessDenied error={tokenError} />;
  }

  return (
    <div className="min-h-screen bg-qurate-slate">
      {/* Header */}
      <header className="border-b border-qurate-slate-light/20">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <QurateLogo />
          <span className="text-qurate-muted text-sm">Fee Calculator</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Calculator Card */}
        <Card className="bg-qurate-slate-light border-qurate-slate-light/30 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-qurate-light text-xl">
              Calculate Your Advisory Fees
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              Enter your Enterprise Value to see the fee breakdown
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-2">
              <Label htmlFor="ev-input" className="text-qurate-light font-medium">
                Enterprise Value (AUD)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-qurate-muted">
                  $
                </span>
                <Input
                  id="ev-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 15,000,000"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  className="pl-8 bg-qurate-slate border-qurate-slate-light/50 text-qurate-light placeholder:text-qurate-muted/50 focus:border-qurate-gold focus:ring-qurate-gold text-lg h-12"
                />
              </div>
              {enterpriseValue > 0 && enterpriseValue < 5_000_000 && (
                <p className="text-sm text-amber-400">
                  Minimum Enterprise Value is $5,000,000
                </p>
              )}
            </div>

            {/* Results Section */}
            {feeResult && (
              <>
                <Separator className="bg-qurate-slate-light/30" />
                
                <div className="space-y-4">
                  <h3 className="text-qurate-light font-semibold text-lg">
                    Fee Breakdown
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Prepare Phase */}
                    <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                      <p className="text-qurate-muted text-sm uppercase tracking-wide">
                        Prepare Phase
                      </p>
                      <p className="text-qurate-gold text-2xl font-bold mt-1">
                        {formatCurrency(feeResult.prepareFee)}
                      </p>
                    </div>

                    {/* Execute Phase */}
                    <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                      <p className="text-qurate-muted text-sm uppercase tracking-wide">
                        Execute Phase
                      </p>
                      <p className="text-qurate-gold text-2xl font-bold mt-1">
                        {formatCurrency(feeResult.executeFee)}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-qurate-gold/10 border border-qurate-gold/30 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-qurate-muted text-sm uppercase tracking-wide">
                          Total Fees
                        </p>
                        <p className="text-qurate-gold text-3xl font-bold mt-1">
                          {formatCurrency(feeResult.totalFee)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-qurate-muted text-sm uppercase tracking-wide">
                          % of EV
                        </p>
                        <p className="text-qurate-light text-2xl font-semibold mt-1">
                          {feeResult.percentageOfEV.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {enterpriseValue > 50_000_000 && (
                    <p className="text-sm text-qurate-muted italic">
                      * Fees are capped at the $50M rate for Enterprise Values above $50,000,000
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reference Table */}
        <Card className="mt-8 bg-qurate-slate-light border-qurate-slate-light/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-qurate-light text-lg">
              Fee Structure Reference
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              Standard fee tiers based on Enterprise Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-qurate-slate-light/30 hover:bg-transparent">
                    <TableHead className="text-qurate-muted">Enterprise Value</TableHead>
                    <TableHead className="text-qurate-muted text-right">Prepare</TableHead>
                    <TableHead className="text-qurate-muted text-right">Execute</TableHead>
                    <TableHead className="text-qurate-muted text-right">Total</TableHead>
                    <TableHead className="text-qurate-muted text-right">% of EV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEE_REFERENCE_TABLE.map((tier, index) => (
                    <TableRow 
                      key={tier.ev}
                      className="border-qurate-slate-light/20 hover:bg-qurate-slate/50"
                    >
                      <TableCell className="text-qurate-light font-medium">
                        {formatCurrency(tier.ev)}{index === FEE_REFERENCE_TABLE.length - 1 ? '+' : ''}
                      </TableCell>
                      <TableCell className="text-qurate-light text-right">
                        {formatCurrency(tier.prepare)}
                      </TableCell>
                      <TableCell className="text-qurate-light text-right">
                        {formatCurrency(tier.execute)}
                      </TableCell>
                      <TableCell className="text-qurate-gold text-right font-semibold">
                        {formatCurrency(tier.total)}
                      </TableCell>
                      <TableCell className="text-qurate-light text-right">
                        {tier.percentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-qurate-muted text-sm space-y-2">
          <p>This is an estimate only. Final fees may vary based on engagement terms.</p>
          <p>
            Contact us at{' '}
            <a 
              href="mailto:info@qurate.com.au" 
              className="text-qurate-gold hover:underline"
            >
              info@qurate.com.au
            </a>
          </p>
          <p className="pt-4">
            <a 
              href="https://www.qurate.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-qurate-gold hover:underline"
            >
              www.qurate.com.au
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
