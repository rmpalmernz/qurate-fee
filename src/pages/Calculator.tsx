import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTokenValidation } from '@/hooks/useTokenValidation';
import {
  calculateFees,
  formatCurrency,
  parseCurrencyInput,
  FEE_TIERS,
  getMonthlyRetainer,
  MIN_RETAINER_MONTHS,
  MAX_RETAINER_MONTHS,
  REBATE_EV_THRESHOLD,
} from '@/lib/feeCalculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageShell from '@/components/layout/PageShell';
import AccessDenied from './AccessDenied';

// Pre-computed retainer month options for performance
const RETAINER_MONTH_OPTIONS = [3, 4, 5, 6] as const;

export default function Calculator() {
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const [enterpriseValue, setEnterpriseValue] = useState(0);
  const [retainerMonths, setRetainerMonths] = useState(MIN_RETAINER_MONTHS);

  // Extract params once
  const token = searchParams.get('token');
  const devMode = searchParams.get('dev') === 'true';

  // Validate token against QVOS backend
  const { isLoading, isValid, error, recipient } = useTokenValidation(token, devMode);

  // Calculate fees when enterprise value changes
  const feeResult = useMemo(() => {
    if (enterpriseValue <= 0) return null;
    return calculateFees(enterpriseValue, retainerMonths);
  }, [enterpriseValue, retainerMonths]);

  // Memoize monthly retainer to avoid recalculation in dropdown
  const monthlyRetainer = useMemo(() => 
    getMonthlyRetainer(enterpriseValue), 
    [enterpriseValue]
  );

  // Memoized dropdown options
  const retainerOptions = useMemo(() => 
    RETAINER_MONTH_OPTIONS.map((m) => ({
      value: m,
      label: `${m} months (${formatCurrency(m * monthlyRetainer)})`,
    })),
    [monthlyRetainer]
  );

  // Memoized event handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    const numericValue = parseCurrencyInput(rawValue);
    setEnterpriseValue(numericValue);
  }, []);

  const handleInputBlur = useCallback(() => {
    if (enterpriseValue > 0) {
      setInputValue(formatCurrency(enterpriseValue).replace('A$', ''));
    }
  }, [enterpriseValue]);

  const handleInputFocus = useCallback(() => {
    if (enterpriseValue > 0) {
      setInputValue(enterpriseValue.toString());
    }
  }, [enterpriseValue]);

  const handleRetainerChange = useCallback((val: string) => {
    setRetainerMonths(parseInt(val, 10));
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-qurate-slate flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-qurate-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-qurate-light animate-pulse">Validating access...</div>
        </div>
      </div>
    );
  }

  // Access denied
  if (!isValid) {
    return <AccessDenied error={error || undefined} />;
  }

  return (
    <PageShell>
      {/* Hero Section with Strapline */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Welcome message if recipient name available */}
        {recipient?.recipientName && (
          <p className="text-qurate-gold text-sm font-medium mb-2">
            Welcome, {recipient.recipientName}
            {recipient.company?.name && ` • ${recipient.company.name}`}
          </p>
        )}
        <h1 className="text-qurate-light text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6">
          Business advice you can count on. People you can trust.
        </h1>
        <p className="text-qurate-muted text-base sm:text-lg md:text-xl font-light">
          Your experienced corporate finance and strategic business transaction advisory team.
        </p>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-8 max-w-4xl space-y-6">
        {/* Calculator Card */}
        <Card className="bg-qurate-slate-light border-qurate-slate-light/30 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-qurate-light text-2xl md:text-3xl font-semibold">
              Fee Calculator
            </CardTitle>
            <CardDescription className="text-qurate-muted text-base">
              Enter your Enterprise Value to see the fee breakdown
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="retainer-months" className="text-qurate-light font-medium">
                  Retainer Months Paid
                </Label>
                <Select
                  value={retainerMonths.toString()}
                  onValueChange={handleRetainerChange}
                >
                  <SelectTrigger
                    id="retainer-months"
                    className="bg-qurate-slate border-qurate-slate-light/50 text-qurate-light h-12"
                  >
                    <SelectValue placeholder="Select months" />
                  </SelectTrigger>
                  <SelectContent className="bg-qurate-slate border-qurate-slate-light/50">
                    {retainerOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        className="text-qurate-light focus:bg-qurate-slate-light"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-qurate-muted">
                  {enterpriseValue < 5_000_000 ? '$10k' : '$15k'}/mo • 50% credited against Success Fee
                </p>
              </div>
            </div>

            {/* Results Section */}
            {feeResult && (
              <>
                <Separator className="bg-qurate-slate-light/30" />

                <div className="space-y-4">
                  <h3 className="text-qurate-light font-semibold text-lg">
                    Success Fee Breakdown
                  </h3>

                  {/* Tier Breakdown Table */}
                  <div className="rounded-lg border border-qurate-slate-light/20 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-qurate-slate-light/30 hover:bg-transparent">
                          <TableHead className="text-qurate-muted">Tier</TableHead>
                          <TableHead className="text-qurate-muted text-right">Amount</TableHead>
                          <TableHead className="text-qurate-muted text-right">Rate</TableHead>
                          <TableHead className="text-qurate-muted text-right">Fee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feeResult.tierBreakdown.map((tier, idx) => (
                          <TableRow
                            key={idx}
                            className="border-qurate-slate-light/20 hover:bg-qurate-slate/50"
                          >
                            <TableCell className="text-qurate-light font-medium">
                              {tier.label}
                            </TableCell>
                            <TableCell className="text-qurate-light text-right">
                              {formatCurrency(tier.amount)}
                            </TableCell>
                            <TableCell className="text-qurate-gold text-right font-semibold">
                              {(tier.rate * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-qurate-light text-right">
                              {formatCurrency(tier.fee)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary Cards - Restructured */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Total Retainers Paid - FIRST */}
                    <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                      <p className="text-qurate-muted text-sm uppercase tracking-wide">
                        Total Retainers Paid
                      </p>
                      <p className="text-qurate-light text-2xl font-bold mt-1">
                        {formatCurrency(feeResult.retainerPaid)}
                      </p>
                      <p className="text-xs text-qurate-muted mt-1">
                        {retainerMonths} months × {formatCurrency(monthlyRetainer)}
                      </p>
                    </div>

                    {/* Transaction Structuring Fee */}
                    <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                      <p className="text-qurate-muted text-sm uppercase tracking-wide">
                        Transaction Structuring Fee
                      </p>
                      <p className="text-qurate-light text-2xl font-bold mt-1">
                        {formatCurrency(feeResult.transactionStructuringFee)}
                      </p>
                      <p className="text-xs text-qurate-muted mt-1">On term sheet execution</p>
                    </div>

                    {/* Gross Success Fee */}
                    <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                      <p className="text-qurate-muted text-sm uppercase tracking-wide">
                        Gross Success Fee
                      </p>
                      <p className="text-qurate-light text-2xl font-bold mt-1">
                        {formatCurrency(feeResult.grossSuccessFee)}
                      </p>
                    </div>

                    {/* Retainer Rebate - only show if rebate applies and retainer paid */}
                    {feeResult.rebateApplies && feeResult.retainerRebate > 0 && (
                      <div className="bg-qurate-slate rounded-lg p-4 border border-qurate-slate-light/20">
                        <p className="text-qurate-muted text-sm uppercase tracking-wide">
                          Retainer Rebate
                        </p>
                        <p className="text-green-400 text-2xl font-bold mt-1">
                          -{formatCurrency(feeResult.retainerRebate)}
                        </p>
                        <p className="text-xs text-qurate-muted mt-1">50% of retainers credited</p>
                      </div>
                    )}
                  </div>

                  {/* Total Fees */}
                  <div className="bg-qurate-gold/10 border border-qurate-gold/30 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-qurate-muted text-sm uppercase tracking-wide">
                          Total Fees
                        </p>
                        <p className="text-qurate-gold text-3xl font-bold mt-1">
                          {formatCurrency(feeResult.totalFees)}
                        </p>
                        <p className="text-xs text-qurate-muted mt-1">
                          Retainers + TSF + Success Fee - Rebate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-qurate-muted text-sm uppercase tracking-wide">
                          Effective Rate
                        </p>
                        <p className="text-qurate-light text-2xl font-semibold mt-1">
                          {feeResult.effectiveRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reference Table Card */}
        <Card className="bg-qurate-slate-light border-qurate-slate-light/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-qurate-light text-lg">
              Fee Structure Reference
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              Cumulative tiered percentages based on Enterprise Value
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-qurate-slate-light/30 hover:bg-transparent">
                    <TableHead className="text-qurate-muted">Tier</TableHead>
                    <TableHead className="text-qurate-muted text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEE_TIERS.map((tier, idx) => (
                    <TableRow
                      key={idx}
                      className="border-qurate-slate-light/20 hover:bg-qurate-slate/50"
                    >
                      <TableCell className="text-qurate-light font-medium">{tier.label}</TableCell>
                      <TableCell className="text-qurate-gold text-right font-semibold">
                        {(tier.rate * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-qurate-slate-light/20">
              <p className="text-sm text-qurate-muted">
              <strong>Monthly Retainer:</strong> $10k (EV &lt; $5M) or $15k (EV ≥ $5M) • {MIN_RETAINER_MONTHS}-{MAX_RETAINER_MONTHS} months — 50% credited against Success Fee when EV ≥ {formatCurrency(REBATE_EV_THRESHOLD)}
              </p>
              <p className="text-sm text-qurate-muted mt-1">
                <strong>Transaction Structuring Fee:</strong> Tiered by EV ($20k–$50k) — payable on term sheet execution
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Token validity footer */}
        {recipient?.expiresAt && (
          <div className="text-center text-xs text-qurate-muted">
            This link expires on {recipient.expiresAt.toLocaleDateString('en-AU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
