
// src/lib/pdf-generator.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Invoice } from '@/firebase/rtdb/invoices';

export const generateInvoicePdf = (invoice: Invoice) => {
  const doc = new jsPDF();
  const currencySymbol = invoice.currency;

  // Add header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice ${invoice.invoiceNumber}`, 14, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');


  // Business and Client details
  doc.setFontSize(10);
  doc.text('From:', 14, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.businessName, 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.businessAddress, 14, 50);
  doc.text(invoice.businessContact || '', 14, 55);
  
  doc.text('To:', 140, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.clientName, 140, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientAddress || '', 140, 50);
  doc.text(invoice.clientContact || '', 140, 55);

  doc.text(`Date: ${format(new Date(invoice.invoiceDate), 'PPP')}`, 140, 65);
  doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'PPP')}`, 140, 70);


  // Items table
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const taxAmount = invoice.taxType === 'amount' ? invoice.tax : subtotal * (invoice.tax / 100);
  const total = subtotal + taxAmount;
  
  const tableRows = invoice.items.map(item => [
    item.description,
    item.quantity,
    `${currencySymbol} ${item.price.toFixed(2)}`,
    `${currencySymbol} ${(item.quantity * item.price).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Description", "Quantity", "Price", "Total"]],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [38, 50, 56] }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY;

  // Totals
  doc.setFontSize(12);
  let yPos = finalY + 10;
  
  const taxLabel = `Tax (${invoice.taxType === 'percentage' ? `${invoice.tax}%` : 'fixed'})`;

  const totals = [
    ['Subtotal', `${currencySymbol} ${subtotal.toFixed(2)}`],
    [taxLabel, `${currencySymbol} ${taxAmount.toFixed(2)}`],
    ['Total', `${currencySymbol} ${total.toFixed(2)}`]
  ];

  totals.forEach(([label, value], i) => {
    doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
    doc.text(label, 140, yPos);
    doc.text(value, 180, yPos, { align: 'right' });
    yPos += 7;
  });

  // Notes
  if (invoice.notes) {
      yPos += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(invoice.notes, 180);
      doc.text(splitNotes, 14, yPos);
      yPos += (splitNotes.length * 5) + 5;
  }

  // Payment Method
  if (invoice.status !== 'paid' && invoice.paymentMethod === 'link' && invoice.linkPayUrl) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Instructions', 14, yPos);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('To pay this invoice, please use the following link:', 14, yPos);
    doc.setTextColor(6, 69, 173); // Blue color for link
    doc.textWithLink('Click here to Pay Online', 14, yPos + 5, { url: invoice.linkPayUrl });
    doc.setTextColor(0);
  } else if (invoice.status !== 'paid') {
      yPos += 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Instructions', 14, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('To complete payment, please view the online version of this invoice.', 14, yPos);
  }


  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`© ${new Date().getFullYear()} ${invoice.businessName}. All Rights Reserved.`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
