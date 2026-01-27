// Fee calculation logic based on Qurate's sliding scale model

interface FeeTier {
  ev: number;
  prepare: number;
  execute: number;
}

// Fee tiers from the model (in dollars)
const FEE_TIERS: FeeTier[] = [
  { ev: 5_000_000, prepare: 50_000, execute: 250_000 },
  { ev: 10_000_000, prepare: 75_000, execute: 425_000 },
  { ev: 20_000_000, prepare: 75_000, execute: 685_000 },
  { ev: 30_000_000, prepare: 75_000, execute: 1_070_000 },
  { ev: 40_000_000, prepare: 75_000, execute: 1_220_000 },
  { ev: 50_000_000, prepare: 75_000, execute: 1_370_000 },
];

export interface FeeResult {
  enterpriseValue: number;
  prepareFee: number;
  executeFee: number;
  totalFee: number;
  percentageOfEV: number;
}

function interpolate(
  value: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number
): number {
  if (x1 === x2) return y1;
  return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
}

export function calculateFees(enterpriseValue: number): FeeResult | null {
  if (enterpriseValue < 5_000_000) {
    return null; // Below minimum threshold
  }

  // Cap at $50M rate for values above
  const cappedEV = Math.min(enterpriseValue, 50_000_000);
  
  let prepareFee: number;
  let executeFee: number;

  // Find the appropriate tier or interpolate
  if (cappedEV >= 50_000_000) {
    // At or above max tier - use max tier rates
    prepareFee = FEE_TIERS[5].prepare;
    executeFee = FEE_TIERS[5].execute;
  } else {
    // Find the tier range and interpolate
    let lowerTier = FEE_TIERS[0];
    let upperTier = FEE_TIERS[0];

    for (let i = 0; i < FEE_TIERS.length - 1; i++) {
      if (cappedEV >= FEE_TIERS[i].ev && cappedEV < FEE_TIERS[i + 1].ev) {
        lowerTier = FEE_TIERS[i];
        upperTier = FEE_TIERS[i + 1];
        break;
      }
    }

    // Interpolate prepare fee (with special handling for $5M tier)
    if (cappedEV <= 10_000_000) {
      prepareFee = interpolate(
        cappedEV,
        FEE_TIERS[0].ev,
        FEE_TIERS[1].ev,
        FEE_TIERS[0].prepare,
        FEE_TIERS[1].prepare
      );
    } else {
      // Prepare fee is flat $75k above $10M
      prepareFee = 75_000;
    }

    // Interpolate execute fee
    executeFee = interpolate(
      cappedEV,
      lowerTier.ev,
      upperTier.ev,
      lowerTier.execute,
      upperTier.execute
    );
  }

  const totalFee = prepareFee + executeFee;
  const percentageOfEV = (totalFee / enterpriseValue) * 100;

  return {
    enterpriseValue,
    prepareFee: Math.round(prepareFee),
    executeFee: Math.round(executeFee),
    totalFee: Math.round(totalFee),
    percentageOfEV: Math.round(percentageOfEV * 100) / 100,
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

// Reference table for display
export const FEE_REFERENCE_TABLE = FEE_TIERS.map((tier) => ({
  ev: tier.ev,
  prepare: tier.prepare,
  execute: tier.execute,
  total: tier.prepare + tier.execute,
  percentage: ((tier.prepare + tier.execute) / tier.ev) * 100,
}));
