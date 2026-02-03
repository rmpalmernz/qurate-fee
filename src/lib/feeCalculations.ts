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
export const MAX_RETAINER_REBATE = 37_500; // Maximum rebate cap per T&C
export const REBATE_EV_THRESHOLD = 10_000_000; // Rebate only applies when EV >= $10M

// Tiered Transaction Structuring Fee based on EV
// Note: T&C uses exclusive upper bounds (e.g., $5M to $9,999,999)
// So $10M exactly falls into the $10M-$15M tier
export interface TSFTier {
  minExclusive: number; // Value must be > this (except first tier)
  upTo: number;         // Value must be <= this
  fee: number;
  label: string;
}

export const TSF_TIERS: TSFTier[] = [
  { minExclusive: 0, upTo: 5_000_000, fee: 20_000, label: 'Up to $5M' },
  { minExclusive: 5_000_000, upTo: 9_999_999, fee: 25_000, label: '$5M - $10M' },
  { minExclusive: 9_999_999, upTo: 14_999_999, fee: 30_000, label: '$10M - $15M' },
  { minExclusive: 14_999_999, upTo: 29_999_999, fee: 35_000, label: '$15M - $30M' },
  { minExclusive: 29_999_999, upTo: Infinity, fee: 50_000, label: '$30M+' },
];

/**
 * Get Transaction Structuring Fee based on Enterprise Value
 * Uses T&C boundary logic: $10,000,000 exactly is in the $10M-$15M tier
 */
export function getTransactionStructuringFee(enterpriseValue: number): number {
  for (const tier of TSF_TIERS) {
    if (enterpriseValue > tier.minExclusive && enterpriseValue <= tier.upTo) {
      return tier.fee;
    }
  }
  // Above $30M
  return TSF_TIERS[TSF_TIERS.length - 1].fee;
}

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
  rebateApplies: boolean;
  netSuccessFee: number; // Gross success fee minus rebate
  transactionStructuringFee: number;
  totalFees: number; // All fees: net success fee + TSF
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

  // Calculate retainer rebate (only applies when EV >= $10M, capped at $37,500)
  const cappedMonths = Math.min(retainerMonthsPaid, MAX_RETAINER_MONTHS);
  const retainerPaid = cappedMonths * MONTHLY_RETAINER;
  const rebateApplies = enterpriseValue >= REBATE_EV_THRESHOLD;
  const uncappedRebate = rebateApplies ? retainerPaid * RETAINER_REBATE_RATE : 0;
  const retainerRebate = Math.min(uncappedRebate, MAX_RETAINER_REBATE);

  // Get tiered Transaction Structuring Fee
  const transactionStructuringFee = getTransactionStructuringFee(enterpriseValue);

  // Net success fee after rebate
  const netSuccessFee = Math.max(0, grossSuccessFee - retainerRebate);

  // Total fees = net success fee + transaction structuring fee
  const totalFees = netSuccessFee + transactionStructuringFee;

  // Effective rate as percentage of EV (based on total fees)
  const effectiveRate =
    enterpriseValue > 0 ? (totalFees / enterpriseValue) * 100 : 0;

  return {
    enterpriseValue,
    tierBreakdown,
    grossSuccessFee: Math.round(grossSuccessFee),
    retainerPaid: Math.round(retainerPaid),
    retainerRebate: Math.round(retainerRebate),
    rebateApplies,
    netSuccessFee: Math.round(netSuccessFee),
    transactionStructuringFee,
    totalFees: Math.round(totalFees),
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
