// Fee calculation logic based on Qurate's tiered fee structure
// Total Fee = Retainer + Success Fee
// Success Fee = Terms Agreed + Completion Fee + Sliding Scale

interface FeeBand {
  minEV: number;
  maxEV: number;
  termsAgreed: number;      // Fixed fee when terms agreed
  completionFee: number;    // Fixed completion fee
  slidingScaleRate: number; // Percentage for sliding scale (cumulative)
}

// Fee bands with cumulative sliding scale
const FEE_BANDS: FeeBand[] = [
  { minEV: 2_000_000, maxEV: 5_000_000, termsAgreed: 20_000, completionFee: 125_000, slidingScaleRate: 0.035 },
  { minEV: 5_000_000, maxEV: 10_000_000, termsAgreed: 30_000, completionFee: 270_000, slidingScaleRate: 0.025 },
  { minEV: 10_000_000, maxEV: 20_000_000, termsAgreed: 35_000, completionFee: 400_000, slidingScaleRate: 0.025 },
  { minEV: 20_000_000, maxEV: 50_000_000, termsAgreed: 50_000, completionFee: 600_000, slidingScaleRate: 0.015 },
];

export interface FeeResult {
  enterpriseValue: number;
  termsAgreedFee: number;
  completionFee: number;
  slidingScaleFee: number;
  totalSuccessFee: number;
  percentageOfEV: number;
  breakdown: BandBreakdown[];
}

export interface BandBreakdown {
  band: string;
  evInBand: number;
  termsAgreed: number;
  completionFee: number;
  slidingScale: number;
}

export function calculateFees(enterpriseValue: number): FeeResult | null {
  // Minimum EV is $2M
  if (enterpriseValue < 2_000_000) {
    return null;
  }

  // Cap at $50M
  const cappedEV = Math.min(enterpriseValue, 50_000_000);

  let totalTermsAgreed = 0;
  let totalCompletionFee = 0;
  let totalSlidingScale = 0;
  const breakdown: BandBreakdown[] = [];

  for (const band of FEE_BANDS) {
    // Check if EV reaches this band
    if (cappedEV <= band.minEV) {
      break;
    }

    // Calculate how much EV falls within this band
    const evInBand = Math.min(cappedEV, band.maxEV) - band.minEV;
    
    if (evInBand <= 0) continue;

    // Calculate sliding scale for this band
    const slidingScale = evInBand * band.slidingScaleRate;

    // Determine if this is the highest band reached
    const isHighestBand = cappedEV <= band.maxEV;

    // Add fixed fees (only for the highest band reached, or accumulate - let me check)
    // Based on the table, fees seem to be for the band you're IN
    // For $25M, only the $20-50M band shows the fixed fees
    
    // Actually, looking at the table for $25M EV, only $20-50M row shows $25M
    // This suggests only the current band's fixed fees apply
    
    // Let me implement as: fixed fees apply only for the highest band
    const termsAgreed = isHighestBand ? band.termsAgreed : 0;
    const completionFee = isHighestBand ? band.completionFee : 0;

    totalTermsAgreed += termsAgreed;
    totalCompletionFee += completionFee;
    totalSlidingScale += slidingScale;

    breakdown.push({
      band: `$${(band.minEV / 1_000_000).toFixed(0)}M to $${(band.maxEV / 1_000_000).toFixed(0)}M`,
      evInBand,
      termsAgreed,
      completionFee,
      slidingScale: Math.round(slidingScale),
    });
  }

  const totalSuccessFee = totalTermsAgreed + totalCompletionFee + totalSlidingScale;
  const percentageOfEV = (totalSuccessFee / enterpriseValue) * 100;

  return {
    enterpriseValue,
    termsAgreedFee: Math.round(totalTermsAgreed),
    completionFee: Math.round(totalCompletionFee),
    slidingScaleFee: Math.round(totalSlidingScale),
    totalSuccessFee: Math.round(totalSuccessFee),
    percentageOfEV: Math.round(percentageOfEV * 100) / 100,
    breakdown,
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

// Reference table for display showing max fees at each tier
export const FEE_REFERENCE_TABLE = [
  { ev: 5_000_000, termsAgreed: 20_000, completionFee: 125_000, rate: '3.50%' },
  { ev: 10_000_000, termsAgreed: 30_000, completionFee: 270_000, rate: '2.50%' },
  { ev: 20_000_000, termsAgreed: 35_000, completionFee: 400_000, rate: '2.50%' },
  { ev: 50_000_000, termsAgreed: 50_000, completionFee: 600_000, rate: '1.50%' },
];
