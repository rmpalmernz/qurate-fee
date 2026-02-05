 import { jsPDF } from 'jspdf';
 import { FeeResult, formatCurrency, getMonthlyRetainer } from './feeCalculations';
 
 // Qurate logo as base64 SVG data URL
 const QURATE_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 462 168">
   <defs>
     <style>
       .st0 { fill: #ca8d05; }
       .st1 { fill: #2E3D49; }
     </style>
   </defs>
   <path class="st1" d="M115.2,33.5h13.7c.6,0,1,.4,1,1v40.4c0,6.6.2,10.8.6,12.8.7,3.1,2.2,5.6,4.7,7.5s5.9,2.8,10.1,2.8,7.6-.9,9.9-2.7,3.5-4,4-6.6c.4-2.6.7-6.9.7-13v-41.3c0-.5.4-1,1-1h13.7c.6,0,1,.4,1,1v39.2c0,9.2-.4,15.7-1.3,19.5s-2.4,7-4.6,9.6c-2.2,2.6-5.3,4.7-9,6.2-3.8,1.6-8.7,2.3-14.8,2.3s-12.9-.8-16.7-2.5c-3.8-1.7-6.8-3.9-9-6.6-2.2-2.7-3.7-5.5-4.3-8.5-1-4.4-1.5-10.8-1.5-19.4v-39.8c0-.5.4-1,1-1h0Z"/>
   <path class="st1" d="M191,109.5V34.5c0-.5.4-1,1-1h31.7c8.2,0,14.2.7,17.9,2.1,3.7,1.4,6.7,3.8,8.9,7.4,2.2,3.5,3.4,7.6,3.4,12.1s-1.7,10.5-5.1,14.3c-3,3.3-7.2,5.5-12.8,6.7-.8.2-1.1,1.3-.3,1.8,2.4,1.6,4.5,3.3,6.2,5.1,2.2,2.3,5.1,6.5,8.8,12.5l8.5,13.5c.4.7,0,1.5-.8,1.5h-15.9c-.3,0-.6-.2-.8-.4l-11-15.9c-4-5.8-6.8-9.5-8.3-11-1.5-1.5-3.1-2.6-4.7-3.1-1.7-.6-4.3-.8-7.9-.8h-2.2c-.5,0-1,.4-1,1v29.4c0,.5-.4,1-1,1h-13.7c-.5,0-1-.4-1-1h0ZM205.3,65.3c0,.5.4,1,1,1h10.8c7.6,0,12.4-.3,14.3-1,1.9-.6,3.4-1.8,4.4-3.3,1.1-1.6,1.6-3.5,1.6-5.9s-.7-4.8-2.1-6.4c-1.4-1.6-3.4-2.7-6-3.1-1.3-.2-5.1-.3-11.6-.3h-11.4c-.5,0-1,.4-1,1v18h0Z"/>
   <path class="st1" d="M311.1,33.5h-13.7c-.9,0-1.6.5-1.9,1.3l-28.9,74.3c-.2.6.2,1.3.9,1.3h14.1c.9,0,1.7-.6,2-1.4l5.5-15.1c.1-.4.5-.6.9-.6h28.7c.4,0,.8.2.9.6l6.1,15.8c.1.4.5.6.9.6h15.3c.7,0,1.2-.7.9-1.3l-29.8-74.4c-.3-.8-1-1.2-1.8-1.2h0ZM294.2,79.2l9-24.6c.3-.8,1.5-.8,1.8,0l9.1,24.6c.2.6-.2,1.3-.9,1.3h-18.1c-.7,0-1.1-.7-.9-1.3h0Z"/>
   <path class="st1" d="M353.5,109.5v-62.2c0-.5-.4-1-1-1h-20.9c-.5,0-1-.4-1-1v-10.9c0-.5.4-1,1-1h59.3c.5,0,1,.4,1,1v10.9c0,.5-.4,1-1,1h-20.9c-.5,0-1,.4-1,1v62.2c0,.5-.4,1-1,1h-13.7c-.5,0-1-.4-1-1h0Z"/>
   <path class="st1" d="M114.7,166.9l16.4-39.3h4.5l16,39.3h-4.1l-4.8-12.4h-19l-4.9,12.4h-4.1ZM125.1,151.4h16.3l-8.2-20.7-8.2,20.7Z"/>
   <path class="st1" d="M166.1,166.9v-39.3h14.2c1.2,0,2.3,0,3.4,0s2.2.2,3.3.4,2.1.5,3.2.9c1,.4,2,.9,3,1.6,1.4.9,2.5,2.1,3.4,3.5s1.6,2.8,2.1,4.3c.5,1.5.9,3,1.1,4.6s.3,3,.3,4.3,0,2.6-.3,4-.4,2.7-.8,4c-.4,1.3-.9,2.5-1.5,3.7s-1.4,2.3-2.4,3.2c-1,1-2,1.8-3.2,2.5-1.1.6-2.3,1.1-3.6,1.4-1.3.4-2.6.6-3.9.7s-2.7.2-4.1.2h-14.3ZM170.1,163.8h9.4c1.8,0,3.4-.1,5-.3s3.2-.7,4.8-1.5c1.4-.7,2.5-1.6,3.4-2.7s1.6-2.4,2.1-3.7.9-2.7,1.1-4.2c.2-1.5.3-2.9.3-4.2s-.1-2.9-.3-4.4c-.2-1.5-.6-2.9-1.1-4.2-.5-1.3-1.3-2.6-2.2-3.7s-2.1-2-3.6-2.8c-1.2-.6-2.7-1-4.4-1.2s-3.4-.3-5.2-.3h-9.4v33h0Z"/>
   <path class="st1" d="M213.2,127.6h4.1l12.6,35,12.5-35h4.1l-14.5,39.4h-4.3s-14.5-39.3-14.5-39.4Z"/>
   <path class="st1" d="M262.6,166.9v-39.3h3.9v39.3h-3.9Z"/>
   <path class="st1" d="M287.8,155.2c.1,1.8.6,3.2,1.2,4.4s1.5,2.2,2.6,3c1.1.8,2.3,1.3,3.7,1.7,1.4.4,2.9.5,4.5.5s3.5-.2,4.8-.7,2.5-1,3.3-1.8c.9-.8,1.5-1.6,1.9-2.6.4-1,.6-2,.6-3.1s-.4-2.8-1.1-3.7-1.7-1.7-2.9-2.3-2.5-1.1-4-1.4c-1.5-.4-3.1-.7-4.7-1.1-1.6-.4-3.2-.8-4.7-1.2-1.5-.5-2.9-1.1-4.1-1.9s-2.1-1.8-2.9-3.1c-.7-1.3-1.1-2.9-1.1-4.8s.3-2.7.9-3.9,1.5-2.4,2.7-3.4c1.2-1,2.6-1.8,4.4-2.3s3.8-.9,6.1-.9,4.4.3,6.2.9,3.2,1.5,4.4,2.5,2,2.3,2.6,3.7.9,2.9.9,4.5h-3.8c0-1.5-.3-2.8-.8-3.9-.6-1.1-1.3-2-2.3-2.7-1-.7-2.1-1.2-3.3-1.5-1.2-.3-2.5-.5-3.8-.5-2,0-3.7.3-5.1.8s-2.5,1.2-3.3,2.1-1.4,1.8-1.7,2.8c-.3,1-.4,2-.2,3.1.2,1.3.8,2.3,1.6,3.1s1.9,1.4,3.1,1.9,2.6.9,4.1,1.2c1.5.3,3,.6,4.5,1,1.5.4,3,.8,4.5,1.2,1.5.5,2.7,1.1,3.9,1.9s2,1.8,2.7,3.1c.7,1.3,1,2.8,1,4.7,0,3.6-1.3,6.5-4,8.5-2.7,2-6.4,3-11.2,3s-4.2-.3-6-.8c-1.9-.5-3.5-1.3-4.8-2.4-1.4-1.1-2.4-2.4-3.2-4-.8-1.6-1.1-3.4-1.1-5.6h3.8Z"/>
   <path class="st1" d="M328.9,147.3c0-2.9.4-5.6,1.2-8.1.8-2.5,2.1-4.7,3.7-6.6,1.6-1.9,3.6-3.4,6-4.4s5.2-1.6,8.3-1.6,6.1.5,8.5,1.6c2.5,1.1,4.5,2.6,6.1,4.4,1.6,1.9,2.9,4.1,3.7,6.6s1.2,5.2,1.2,8.1-.4,5.5-1.2,8-2.1,4.7-3.7,6.6-3.6,3.4-6.1,4.4-5.2,1.6-8.5,1.6-6-.6-8.5-1.6c-2.4-1.1-4.5-2.6-6.1-4.4s-2.8-4.1-3.6-6.6-1.2-5.2-1.2-8h0ZM348.4,164.8c2.7,0,5-.5,7-1.4,2-1,3.5-2.2,4.8-3.9,1.2-1.6,2.2-3.5,2.8-5.6s.9-4.3.9-6.6-.4-5.2-1.1-7.4c-.7-2.2-1.8-4-3.1-5.6s-3-2.7-4.9-3.5c-1.9-.8-4.1-1.2-6.5-1.2s-5,.5-6.9,1.5-3.5,2.3-4.8,3.9c-1.3,1.6-2.2,3.5-2.8,5.6s-.9,4.3-.9,6.6.3,4.6.9,6.7c.6,2.1,1.5,4,2.8,5.6s2.9,2.9,4.8,3.8c2,.9,4.3,1.4,7,1.4h0Z"/>
   <path class="st1" d="M388.4,149.1v17.9h-3.9v-39.3h16.3c4.6,0,8.1.8,10.5,2.4,2.4,1.6,3.6,4.2,3.6,7.9s-.5,4.4-1.6,5.9c-1.1,1.5-2.8,2.7-5.2,3.7,1.2.4,2.2,1,2.9,1.8.7.8,1.2,1.6,1.6,2.6s.6,2,.7,3.1c.1,1.1.2,2.1.2,3.2,0,1.5.1,2.7.2,3.7.1,1,.2,1.8.4,2.4.1.6.3,1.1.5,1.4.2.4.4.6.7.8v.3h-4.3c-.4-.6-.7-1.5-.9-2.7-.2-1.2-.3-2.4-.4-3.7-.1-1.3-.2-2.5-.2-3.7,0-1.2-.2-2.2-.3-2.9-.2-1.1-.6-1.9-1.1-2.5-.5-.6-1.1-1.1-1.9-1.4s-1.6-.6-2.5-.7c-.9-.1-1.8-.2-2.8-.2h-12.4ZM400.7,145.9c1.5,0,2.8-.1,4.1-.4,1.2-.3,2.4-.8,3.3-1.4.9-.6,1.7-1.4,2.2-2.4s.8-2.2.8-3.6-.3-2.7-.8-3.6-1.3-1.7-2.3-2.2-2-.9-3.2-1.1c-1.2-.2-2.5-.3-3.8-.3h-12.5v15.1h12.3Z"/>
   <path class="st1" d="M444.9,146.6l12.6-19h4.6l-15.1,22.2v17.2h-3.9v-16.9l-14.9-22.5h4.5l12.3,19h0Z"/>
   <path class="st1" d="M401.9,109.5V34.5c0-.5.4-1,1-1h55c.5,0,1,.4,1,1v10.9c0,.5-.4,1-1,1h-39.4c-.5,0-1,.4-1,1v15.1c0,.5.4,1,1,1h36.5c.5,0,1,.4,1,1v10.9c0,.5-.4,1-1,1h-36.5c-.5,0-1,.4-1,1v19.4c0,.5.4,1,1,1h40.8c.5,0,1,.4,1,1v10.9c0,.5-.4,1-1,1h-56.5c-.5,0-1-.4-1-1h0Z"/>
   <path class="st0" d="M91.3,94.1c.4.5.3,1.3-.2,1.8l-10.4,8.9c-.6.5-1.4.4-1.9-.2l-12.7-15.3c-.6.4-1.2.7-1.6.9-3,1.7-8.5,3.4-13.6,3.4-8.5,0-15.6-3.2-21.1-9.6s-9.8-15.7-9.8-28.1,4.2-22.1,9.6-28.3,12.5-9.4,21.3-9.4,15.9,3.1,21.2,9.3c1.7,1.9,3.2,4.2,4.5,6.9,2.9,5.7,4.7,12.9,4.7,21.4h0v.2c0,9.7-2.2,14-4.3,19.1-.2.4-.3.7-.5,1.1l15,18c-.4-.4-.4-1.1,0-1.6,7-9.4,10.5-21.7,10.5-36.8s-4.7-31.3-13.9-41.1C78.7,4.9,66.3,0,50.8,0s-16.1,1.4-22.6,4.3c-4.9,2.1-9.4,5.3-13.6,9.7-4.1,4.4-7.4,9.3-9.8,14.8C1.6,36.2,0,45.5,0,56.4c0,17.2,4.6,30.6,13.8,40.4,9.2,9.8,21.6,14.7,37.3,14.7s19.2-2.3,26.8-6.7c.3-.2.6-.2.9-.1l9.2,10.9c.5.6,1.4.7,2,.2l10.4-8.9c.5-.4.6-1.3.2-1.8l-9.2-10.9h0Z"/>
   <rect class="st0" x="447.4" y="97.7" width="12.9" height="12.8" rx=".9" ry=".9"/>
 </svg>`)}`;
 
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
 
   // Header with Logo
   const logoWidth = 50;
   const logoHeight = (168 / 462) * logoWidth; // Maintain aspect ratio
   doc.addImage(QURATE_LOGO_SVG, 'SVG', (pageWidth - logoWidth) / 2, y - 5, logoWidth, logoHeight);
   y += logoHeight + 5;
 
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