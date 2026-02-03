// Fee calculation logic based on Qurate's cumulative tiered percentage structure
// Success Fee is calculated like income tax brackets - each band taxed at its own rate

export interface FeeTier {
  upTo: number;
  rate: number;
  label: string;
}

// Cumulative fee tiers from engagement letter
export const FEE_TIERS: FeeTier[] = [
  { upTo: 5_000_000, rate: 0.05, label: 'First $5M' },
  { upTo: 10_000_000, rate: 0.04, label: '$5M - $10M' },
  { upTo: 15_000_000, rate: 0.03, label: '$10M - $15M' },
  { upTo: 20_000_000, rate: 0.025, label: '$15M - $20M' },
  { upTo: Infinity, rate: 0.02, label: 'Above $20M' },
];

// Additional fee constants
export const MONTHLY_RETAINER = 15_000;
export const MAX_RETAINER_MONTHS = 5;
export const RETAINER_REBATE_RATE = 0.5; // 50% rebate
export const TRANSACTION_STRUCTURING_FEE = 35_000;

export interface TierBreakdown {
  label: string;
  amount: number;
  rate: number;
  fee: number;
}

export interface FeeResult {
  enterpriseValue: number;
  tierBreakdown: TierBreakdown[];
  grossSuccessFee: number;
  retainerPaid: number;
  retainerRebate: number;
  netSuccessFee: number;
  transactionStructuringFee: number;
  effectiveRate: number;
}

/**
 * Calculate success fee using cumulative tiered percentages
 */
export function calculateFees(
  enterpriseValue: number,
  retainerMonthsPaid: number = 0
): FeeResult {
  const tierBreakdown: TierBreakdown[] = [];
  let remaining = enterpriseValue;
  let prevCap = 0;
  let grossSuccessFee = 0;

  for (const tier of FEE_TIERS) {
    if (remaining <= 0) break;

    const tierSize = tier.upTo === Infinity ? remaining : tier.upTo - prevCap;
    const taxableAmount = Math.min(remaining, tierSize);
    const tierFee = taxableAmount * tier.rate;

    if (taxableAmount > 0) {
      tierBreakdown.push({
        label: tier.label,
        amount: taxableAmount,
        rate: tier.rate,
        fee: tierFee,
      });
      grossSuccessFee += tierFee;
    }

    remaining -= taxableAmount;
    prevCap = tier.upTo;
  }

  // Calculate retainer rebate
  const cappedMonths = Math.min(retainerMonthsPaid, MAX_RETAINER_MONTHS);
  const retainerPaid = cappedMonths * MONTHLY_RETAINER;
  const retainerRebate = retainerPaid * RETAINER_REBATE_RATE;

  // Net success fee after rebate
  const netSuccessFee = Math.max(0, grossSuccessFee - retainerRebate);

  // Effective rate as percentage of EV
  const effectiveRate =
    enterpriseValue > 0 ? (netSuccessFee / enterpriseValue) * 100 : 0;

  return {
    enterpriseValue,
    tierBreakdown,
    grossSuccessFee: Math.round(grossSuccessFee),
    retainerPaid: Math.round(retainerPaid),
    retainerRebate: Math.round(retainerRebate),
    netSuccessFee: Math.round(netSuccessFee),
    transactionStructuringFee: TRANSACTION_STRUCTURING_FEE,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
