 import { jsPDF } from 'jspdf';
 import { FeeResult, formatCurrency, getMonthlyRetainer } from './feeCalculations';
 
 /**
 * Generate a PDF fee breakdown document
 */
 export function generateFeePDF(feeResult: FeeResult, retainerMonths: number): void {
   const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.getWidth();
   const margin = 20;
   const contentWidth = pageWidth - margin * 2;
   let y = margin;
 
   // Helper functions
   const addLine = (height = 5) => { y += height; };
   const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', align: 'left' | 'center' | 'right' = 'left') => {
     doc.setFontSize(size);
     doc.setFont('helvetica', style);
     const x = align === 'center' ? pageWidth / 2 : align === 'right' ? pageWidth - margin : margin;
     doc.text(text, x, y, { align });
   };
   const addRow = (label: string, value: string, labelBold = false, valueBold = false) => {
     doc.setFontSize(11);
     doc.setFont('helvetica', labelBold ? 'bold' : 'normal');
     doc.text(label, margin, y);
     doc.setFont('helvetica', valueBold ? 'bold' : 'normal');
     doc.text(value, pageWidth - margin, y, { align: 'right' });
     addLine(7);
   };
 
   // Header
   addText('QURATE', 24, 'bold', 'center');
   addLine(8);
   addText('Fee Estimate', 16, 'normal', 'center');
   addLine(12);
 
   // Divider
   doc.setDrawColor(193, 145, 49); // Qurate gold
   doc.setLineWidth(0.5);
   doc.line(margin, y, pageWidth - margin, y);
   addLine(10);
 
   // Enterprise Value
   addText('Enterprise Value', 12, 'bold');
   addLine(7);
   addText(formatCurrency(feeResult.enterpriseValue), 18, 'bold');
   addLine(15);
 
   // Fee Summary Section
   doc.setFillColor(46, 61, 73); // Qurate slate
   doc.rect(margin, y - 5, contentWidth, 8, 'F');
   doc.setTextColor(255, 255, 255);
   addText('FEE SUMMARY', 11, 'bold');
   doc.setTextColor(0, 0, 0);
   addLine(12);
 
   const monthlyRetainer = getMonthlyRetainer(feeResult.enterpriseValue);
   addRow('Total Retainers Paid', formatCurrency(feeResult.retainerPaid));
   addRow(`  (${retainerMonths} months × ${formatCurrency(monthlyRetainer)}/mo)`, '', false, false);
   addLine(2);
   addRow('Transaction Structuring Fee', formatCurrency(feeResult.transactionStructuringFee));
   addRow('Gross Success Fee', formatCurrency(feeResult.grossSuccessFee));
   
   if (feeResult.rebateApplies && feeResult.retainerRebate > 0) {
     addRow('Retainer Rebate (50%)', `-${formatCurrency(feeResult.retainerRebate)}`);
   }
 
   addLine(3);
   doc.setDrawColor(200, 200, 200);
   doc.line(margin, y, pageWidth - margin, y);
   addLine(8);
 
   // Total
   doc.setFillColor(193, 145, 49); // Qurate gold
   doc.rect(margin, y - 5, contentWidth, 12, 'F');
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('TOTAL FEES', margin + 5, y + 2);
   doc.text(formatCurrency(feeResult.totalFees), pageWidth - margin - 5, y + 2, { align: 'right' });
   doc.setTextColor(0, 0, 0);
   addLine(8);
   
   doc.setFontSize(10);
   doc.setFont('helvetica', 'normal');
   doc.text(`Effective Rate: ${feeResult.effectiveRate.toFixed(2)}%`, pageWidth - margin, y, { align: 'right' });
   addLine(15);
 
   // Success Fee Breakdown Section
   doc.setFillColor(46, 61, 73);
   doc.rect(margin, y - 5, contentWidth, 8, 'F');
   doc.setTextColor(255, 255, 255);
   addText('SUCCESS FEE BREAKDOWN', 11, 'bold');
   doc.setTextColor(0, 0, 0);
   addLine(12);
 
   // Table header
   doc.setFontSize(10);
   doc.setFont('helvetica', 'bold');
   doc.text('Tier', margin, y);
   doc.text('Amount', margin + 50, y);
   doc.text('Rate', margin + 100, y);
   doc.text('Fee', pageWidth - margin, y, { align: 'right' });
   addLine(6);
   doc.setDrawColor(200, 200, 200);
   doc.line(margin, y, pageWidth - margin, y);
   addLine(6);
 
   // Table rows
   doc.setFont('helvetica', 'normal');
   feeResult.tierBreakdown.forEach((tier) => {
     doc.text(tier.label, margin, y);
     doc.text(formatCurrency(tier.amount), margin + 50, y);
     doc.text(`${(tier.rate * 100).toFixed(1)}%`, margin + 100, y);
     doc.text(formatCurrency(tier.fee), pageWidth - margin, y, { align: 'right' });
     addLine(6);
   });
 
   addLine(5);
   doc.setDrawColor(200, 200, 200);
   doc.line(margin, y, pageWidth - margin, y);
   addLine(8);
 
   // Footer
   doc.setFontSize(9);
   doc.setTextColor(100, 100, 100);
   const footerY = doc.internal.pageSize.getHeight() - 20;
   doc.text('This is an estimate only. Final fees subject to signed engagement terms.', pageWidth / 2, footerY, { align: 'center' });
   doc.text(`Generated on ${new Date().toLocaleDateString('en-AU')}`, pageWidth / 2, footerY + 5, { align: 'center' });
   doc.text('Qurate Advisory | www.qurate.com.au', pageWidth / 2, footerY + 10, { align: 'center' });
 
   // Save
   const evFormatted = (feeResult.enterpriseValue / 1_000_000).toFixed(1);
   doc.save(`Qurate-Fee-Estimate-${evFormatted}M.pdf`);
 }