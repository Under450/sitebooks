'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatting';
import { PaymentTracker } from '@/components/payments/PaymentTracker';
import { InvoiceItemsManager } from '@/components/invoice/InvoiceItemsManager';

interface Job {
  id: string;
  property_address: string;
  job_type: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount_invoiced: number;
  amount_paid: number;
  job_date: string;
  payment_status: string;
  status: string;
  invoice_sent: boolean;
  invoice_sent_date: string | null;
  invoice_number: string | null;
  payment_due_date: string | null;
  payment_terms: number;
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadJob();
      loadProfile();
      loadInvoiceItems();
    }
  }, [user, params.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, logo_url')
        .eq('id', user?.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadInvoiceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('job_id', params.id)
        .order('item_order', { ascending: true });

      if (error) throw error;
      setInvoiceItems(data || []);
    } catch (error) {
      console.error('Error loading invoice items:', error);
    }
  };

  const loadJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      alert('Failed to load job');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = () => {
    if (!job?.payment_due_date || job.payment_status === 'paid') return 0;
    
    const dueDate = new Date(job.payment_due_date);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const generateInvoiceNumber = async () => {
    // Generate invoice number: INV-YYYY-NNNN
    const year = new Date().getFullYear();
    
    // Get count of invoices this year for this user
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .not('invoice_number', 'is', null)
      .like('invoice_number', `INV-${year}-%`);

    const nextNumber = (count || 0) + 1;
    return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
  };

  const handleGenerateInvoice = async () => {
    if (!job) return;
    
    setGenerating(true);
    try {
      // Generate invoice number if not exists
      let invoiceNumber = job.invoice_number;
      if (!invoiceNumber) {
        invoiceNumber = await generateInvoiceNumber();
      }

      // Calculate due date (use payment_terms if exists, otherwise default to 30)
      const dueDate = new Date();
      const paymentTerms = job.payment_terms || 30;
      dueDate.setDate(dueDate.getDate() + paymentTerms);

      // Update job with invoice info
      const { error } = await supabase
        .from('jobs')
        .update({
          invoice_number: invoiceNumber,
          payment_due_date: dueDate.toISOString().split('T')[0],
          payment_terms: paymentTerms, // Set default if not exists
        })
        .eq('id', job.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Reload job
      await loadJob();
      
      alert('Invoice generated! Click OK to print.');
      
      // Open print dialog
      window.print();
      
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      alert(`Failed to generate invoice: ${error.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsSent = async (method: 'email' | 'printed') => {
    if (!job) return;

    const message = method === 'email' 
      ? `Send invoice to ${job.customer_email}?\n\nNote: Email functionality coming soon. For now, this will mark as sent.`
      : 'Mark invoice as sent (printed)?';

    if (!confirm(message)) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          invoice_sent: true,
          invoice_sent_date: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (error) throw error;

      alert(`Invoice marked as sent via ${method}!`);
      await loadJob();
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      alert('Failed to update invoice status');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!job) return;
    if (!confirm('Mark this invoice as PAID?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          payment_status: 'paid',
        })
        .eq('id', job.id);

      if (error) throw error;

      alert('Invoice marked as PAID! ✅');
      await loadJob();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to update payment status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const daysOverdue = getDaysOverdue();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/jobs" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Job Details</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            job.payment_status === 'paid' ? 'bg-profit/20 text-profit' :
            job.payment_status === 'partial' ? 'bg-blue-100 text-blue-800' :
            job.payment_status === 'invoiced' ? 'bg-amber/20 text-amber' :
            'bg-cost/20 text-cost'
          }`}>
            {job.payment_status === 'paid' ? '✓ Paid' :
             job.payment_status === 'partial' ? '💵 Partially Paid' :
             job.payment_status === 'invoiced' ? '📄 Invoiced' :
             '⏳ Unpaid'}
          </span>

          {job.invoice_sent && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              📧 Invoice Sent
            </span>
          )}

          {daysOverdue > 0 && job.payment_status !== 'paid' && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              ⚠️ {daysOverdue} days overdue
            </span>
          )}
        </div>

        {/* Job Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-charcoal mb-4">{job.property_address}</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Job Type:</span>
              <span className="font-semibold">{job.job_type}</span>
            </div>
            
            {job.invoice_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice #:</span>
                <span className="font-semibold">{job.invoice_number}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Job Date:</span>
              <span className="font-semibold">{new Date(job.job_date).toLocaleDateString()}</span>
            </div>

            {job.invoice_sent_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Sent:</span>
                <span className="font-semibold">{new Date(job.invoice_sent_date).toLocaleDateString()}</span>
              </div>
            )}

            {job.payment_due_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Due:</span>
                <span className="font-semibold">{new Date(job.payment_due_date).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-profit">{formatCurrency(job.amount_invoiced)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-charcoal mb-3">Customer Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">Name:</span> {job.customer_name}</p>
            {job.customer_email && (
              <p><span className="text-gray-600">Email:</span> {job.customer_email}</p>
            )}
            {job.customer_phone && (
              <p><span className="text-gray-600">Phone:</span> {job.customer_phone}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-charcoal mb-2">Description</h3>
            <p className="text-sm text-gray-700">{job.description}</p>
          </div>
        )}

        {/* Invoice Items */}
        <div className="space-y-3">
          <h3 className="font-bold text-charcoal">Invoice Line Items</h3>
          <InvoiceItemsManager
            jobId={job.id}
            userId={user.id}
            onUpdate={() => {
              loadJob();
              loadInvoiceItems();
            }}
          />
        </div>

        {/* Payment Tracking */}
        <div className="space-y-3">
          <h3 className="font-bold text-charcoal">Payments</h3>
          <PaymentTracker
            jobId={job.id}
            userId={user.id}
            totalAmount={job.amount_invoiced}
            onPaymentUpdate={loadJob}
          />
        </div>

        {/* Invoice Actions */}
        <div className="space-y-3">
          <h3 className="font-bold text-charcoal">Invoice Actions</h3>

          {!job.invoice_number ? (
            <Button
              onClick={handleGenerateInvoice}
              fullWidth
              variant="primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : '📄 Generate & Print Invoice'}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleGenerateInvoice}
                fullWidth
                variant="secondary"
              >
                🖨️ Print Invoice
              </Button>

              {!job.invoice_sent && (
                <>
                  <Button
                    onClick={() => handleMarkAsSent('email')}
                    fullWidth
                    variant="primary"
                  >
                    📧 Send via Email
                  </Button>

                  <Button
                    onClick={() => handleMarkAsSent('printed')}
                    fullWidth
                    variant="secondary"
                  >
                    ✓ Mark as Sent (Printed)
                  </Button>
                </>
              )}

              {job.payment_status !== 'paid' && (
                <Button
                  onClick={handleMarkAsPaid}
                  fullWidth
                  variant="primary"
                  className="bg-profit hover:bg-profit/90"
                >
                  💰 Mark as PAID
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Printable Invoice (hidden on screen, shows when printing) */}
      <div className="hidden print:block print:p-8">
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-invoice, .print-invoice * {
              visibility: visible;
            }
            .print-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
        
        <div className="print-invoice max-w-4xl mx-auto bg-white p-12">
          {/* Header with Logo */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="h-20 w-auto max-w-[200px] object-contain mb-4" />
              ) : (
                <div className="text-3xl font-bold text-charcoal mb-4">
                  {profile?.business_name || 'SiteBooks'}
                </div>
              )}
              <div className="text-2xl font-bold text-charcoal">INVOICE</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl mb-2">{job?.invoice_number}</div>
              <div className="text-sm text-gray-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                {job?.payment_due_date && (
                  <div>Due: {new Date(job.payment_due_date).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <div className="font-bold text-gray-700 mb-2">Bill To:</div>
            <div className="text-lg font-semibold">{job?.customer_name}</div>
            <div className="text-gray-600">{job?.property_address}</div>
            {job?.customer_email && <div className="text-gray-600">{job.customer_email}</div>}
            {job?.customer_phone && <div className="text-gray-600">{job.customer_phone}</div>}
          </div>

          {/* Invoice Details */}
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">Qty</th>
                <th className="text-right py-3 px-4">Unit Price</th>
                <th className="text-right py-3 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-4 px-4">
                      <div className="font-semibold">{item.description}</div>
                    </td>
                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4" colSpan={2}>
                    <div className="font-semibold">{job?.job_type}</div>
                    {job?.description && <div className="text-sm text-gray-600 mt-1">{job.description}</div>}
                    {job?.job_date && <div className="text-xs text-gray-500 mt-1">Completed: {new Date(job.job_date).toLocaleDateString()}</div>}
                  </td>
                  <td className="py-4 px-4 text-center">1</td>
                  <td className="py-4 px-4 text-right font-semibold">
                    {formatCurrency(job?.amount_invoiced || 0)}
                  </td>
                </tr>
              )}
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(job?.amount_invoiced || 0)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-800">
                <span className="font-bold text-lg">Total Due:</span>
                <span className="font-bold text-lg">{formatCurrency(job?.amount_invoiced || 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="text-sm text-gray-600 mb-8">
            <div className="font-semibold mb-2">Payment Terms:</div>
            <div>Payment due within {job?.payment_terms || 30} days</div>
            {job?.payment_due_date && (
              <div>Due date: {new Date(job.payment_due_date).toLocaleDateString()}</div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
            <div>Thank you for your business!</div>
            <div className="mt-1">{profile?.business_name || 'SiteBooks'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
