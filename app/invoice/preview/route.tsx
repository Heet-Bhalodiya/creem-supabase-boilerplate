import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceSettings } from '@/lib/actions/app-settings'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Get parameters from URL or use settings defaults
  const settings = await getInvoiceSettings()

  const serial_number_series = searchParams.get('serial_number_series') || settings.invoice_prefix
  const seller_name = searchParams.get('seller_name') || settings.company_name
  const seller_code = searchParams.get('seller_code') || settings.company_code
  const seller_address = searchParams.get('seller_address') || settings.company_address
  const seller_tax_number = searchParams.get('seller_tax_number') || settings.company_tax_number
  const seller_phone = searchParams.get('seller_phone') || settings.company_phone

  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'USD'
  const date = searchParams.get('date') || new Date().toISOString()

  // Generate invoice data
  const invoice_number = `${serial_number_series}-${Math.floor(Math.random() * 10000)}`
  const invoice_date = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const due_date = new Date(new Date(date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subtotal = parseFloat(amount)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice_number}</title>
  <style>
    @media print {
      @page {
        margin: 0;
        size: A4;
      }
      body {
        margin: 0;
        padding: 20mm;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: white;
      color: #1f2937;
      line-height: 1.6;
    }
    
    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 40px;
      margin: -40px -40px 40px;
      border-radius: 0;
    }
    
    .invoice-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .invoice-number {
      font-size: 1.125rem;
      opacity: 0.95;
    }
    
    .invoice-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .meta-section h2 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .meta-section p {
      margin-bottom: 4px;
      font-size: 0.95rem;
    }
    
    .company-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #6366f1;
      margin-bottom: 8px !important;
    }
    
    .payment-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .invoice-table thead {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .invoice-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .invoice-table td {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .item-description {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .item-details {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 1rem;
    }
    
    .totals-row.subtotal {
      color: #6b7280;
    }
    
    .totals-row.total {
      font-size: 1.5rem;
      font-weight: 700;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      margin-top: 8px;
    }
    
    .totals-row.total .amount {
      color: #6366f1;
    }
    
    .invoice-footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
  </style>
  <script>
    // Auto-trigger print dialog for download
    window.onload = function() {
      if (window.location.search.includes('download=true')) {
        setTimeout(() => window.print(), 500);
      }
    }
  </script>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>INVOICE</h1>
      <div class="invoice-number">${invoice_number}</div>
    </div>
    
    <div class="invoice-meta">
      <div class="meta-section">
        <h2>From</h2>
        <p class="company-name">${seller_name || 'Your Company'}</p>
        ${seller_address ? `<p>${seller_address}</p>` : ''}
        ${seller_tax_number ? `<p>Tax ID: ${seller_tax_number}</p>` : ''}
        ${seller_phone ? `<p>Phone: ${seller_phone}</p>` : ''}
        ${seller_code ? `<p>Code: ${seller_code}</p>` : ''}
      </div>
      
      <div class="meta-section">
        <h2>Invoice Details</h2>
        <p><strong>Issue Date:</strong> ${invoice_date}</p>
        <p><strong>Due Date:</strong> ${due_date}</p>
        <p><strong>Status:</strong> <span class="payment-badge">PAID</span></p>
      </div>
    </div>
    
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th style="width: 15%" class="text-right">Quantity</th>
          <th style="width: 17.5%" class="text-right">Unit Price</th>
          <th style="width: 17.5%" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-description">Subscription Payment</div>
            <div class="item-details">Monthly subscription service</div>
          </td>
          <td class="text-right">1</td>
          <td class="text-right">${currency === 'USD' ? '$' : currency}${subtotal.toFixed(2)}</td>
          <td class="text-right">${currency === 'USD' ? '$' : currency}${subtotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="totals">
      <div class="totals-row subtotal">
        <span>Subtotal</span>
        <span>${currency === 'USD' ? '$' : currency}${subtotal.toFixed(2)}</span>
      </div>
      <div class="totals-row subtotal">
        <span>Tax (10%)</span>
        <span>${currency === 'USD' ? '$' : currency}${tax.toFixed(2)}</span>
      </div>
      <div class="totals-row total">
        <span>Total</span>
        <span class="amount">${currency === 'USD' ? '$' : currency}${total.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="invoice-footer">
      <p>Thank you for your business! This invoice was automatically generated.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  })
}
