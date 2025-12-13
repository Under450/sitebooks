'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatting';

interface Job {
  id: string;
  property_address: string;
  job_type: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount_invoiced: number;
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

  useEffect(() => {
    if (user) {
      loadJob();
    }
  }, [user, params.id]);

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

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (job.payment_terms || 30));

      // Update job with invoice info
      const { error } = await supabase
        .from('jobs')
        .update({
          invoice_number: invoiceNumber,
          payment_due_date: dueDate.toISOString().split('T')[0],
        })
        .eq('id', job.id);

      if (error) throw error;

      // Reload job
      await loadJob();
      
      // Open print dialog
      window.print();
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
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
            job.payment_status === 'invoiced' ? 'bg-amber/20 text-amber' :
            'bg-cost/20 text-cost'
          }`}>
            {job.payment_status === 'paid' ? '✓ Paid' :
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
    </div>
  );
}
