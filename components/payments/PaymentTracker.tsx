'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/utils/formatting';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
}

interface PaymentTrackerProps {
  jobId: string;
  userId: string;
  totalAmount: number;
  onPaymentUpdate: () => void;
}

export function PaymentTracker({ jobId, userId, totalAmount, onPaymentUpdate }: PaymentTrackerProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    loadPayments();
  }, [jobId]);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('job_id', jobId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalAmount - totalPaid;

  const handleAddPayment = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      const { error } = await supabase.from('payments').insert({
        user_id: userId,
        job_id: jobId,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference: formData.reference || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      // Reload payments
      await loadPayments();
      
      // Update job payment status
      await updateJobPaymentStatus();
      
      // Reset form
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference: '',
        notes: '',
      });
      setShowAddForm(false);
      
      alert('Payment recorded! ✅');
      onPaymentUpdate();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  const updateJobPaymentStatus = async () => {
    // Recalculate total paid
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('job_id', jobId);

    const total = allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    // Update job
    let status = 'unpaid';
    if (total >= totalAmount) {
      status = 'paid';
    } else if (total > 0) {
      status = 'partial';
    }

    await supabase
      .from('jobs')
      .update({
        amount_paid: total,
        payment_status: status,
      })
      .eq('id', jobId);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Delete this payment record?')) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      await loadPayments();
      await updateJobPaymentStatus();
      onPaymentUpdate();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-bold text-charcoal mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Paid:</span>
            <span className="font-semibold text-profit">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-bold">Balance Due:</span>
            <span className={`font-bold text-lg ${balance > 0 ? 'text-cost' : 'text-profit'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-charcoal mb-3">Payment History</h3>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                  <div className="text-xs text-gray-600">
                    {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                    {payment.reference && ` • Ref: ${payment.reference}`}
                  </div>
                  {payment.notes && <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>}
                </div>
                <button
                  onClick={() => handleDeletePayment(payment.id)}
                  className="text-cost text-sm ml-3"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Payment Button/Form */}
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} fullWidth variant="primary">
          💰 Record Payment
        </Button>
      ) : (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <h3 className="font-bold text-charcoal">Record New Payment</h3>
          
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="100.00"
          />

          <Input
            label="Payment Date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
          />

          <Select
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'card', label: 'Card' },
              { value: 'cheque', label: 'Cheque' },
            ]}
          />

          <Input
            label="Reference (Optional)"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Transaction ID, Cheque #, etc."
          />

          <Input
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes"
          />

          <div className="flex gap-2">
            <Button onClick={handleAddPayment} fullWidth variant="primary">
              ✓ Save Payment
            </Button>
            <Button onClick={() => setShowAddForm(false)} fullWidth variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
