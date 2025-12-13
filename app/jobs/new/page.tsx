'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { JOB_TYPES } from '@/types';
import { getCurrentTaxYear } from '@/utils/taxYear';
import { formatDateForInput } from '@/utils/formatting';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';

export default function NewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    property_address: '',
    job_type: '',
    custom_job_type: '',
    description: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    labour_amount: '',
    materials_amount: '',
    job_date: formatDateForInput(new Date()),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.property_address.trim()) {
      newErrors.property_address = 'Property address is required';
    }
    
    if (!formData.job_type) {
      newErrors.job_type = 'Job type is required';
    }
    
    if (formData.job_type === 'Other' && !formData.custom_job_type.trim()) {
      newErrors.custom_job_type = 'Please specify the job type';
    }
    
    if (!formData.job_date) {
      newErrors.job_date = 'Job date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    if (!user) {
      alert('You must be logged in to create a job');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get tax year for this job
      const taxYear = getCurrentTaxYear();
      
      const labourAmount = parseFloat(formData.labour_amount) || 0;
      const materialsAmount = parseFloat(formData.materials_amount) || 0;
      const totalAmount = labourAmount + materialsAmount;
      
      // Save to Supabase
      const { error } = await supabase.from('jobs').insert({
        user_id: user.id,
        property_address: formData.property_address,
        job_type: formData.job_type === 'Other' ? formData.custom_job_type : formData.job_type,
        description: formData.description,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone || null,
        customer_email: formData.customer_email || null,
        labour_amount: labourAmount,
        materials_amount: materialsAmount,
        amount_invoiced: totalAmount,
        job_date: formData.job_date,
        tax_year: taxYear.label,
        payment_status: 'unpaid',
        status: 'active',
      });
      
      if (error) throw error;
      
      // Show success and redirect
      alert('Job created successfully!');
      router.push('/jobs');
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const jobTypeOptions = JOB_TYPES.map(type => ({
    value: type,
    label: type,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Add New Job</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Property Address */}
        <Input
          label="Property Address"
          name="property_address"
          value={formData.property_address}
          onChange={handleChange}
          placeholder="15 Oak Street, London"
          required
          error={errors.property_address}
        />

        {/* Job Type */}
        <Select
          label="Job Type"
          name="job_type"
          value={formData.job_type}
          onChange={handleChange}
          options={jobTypeOptions}
          required
          error={errors.job_type}
        />

        {/* Custom Job Type (if Other selected) */}
        {formData.job_type === 'Other' && (
          <Input
            label="Specify Job Type"
            name="custom_job_type"
            value={formData.custom_job_type}
            onChange={handleChange}
            placeholder="e.g., Loft Conversion"
            required
            error={errors.custom_job_type}
          />
        )}

        {/* Description */}
        <Textarea
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of the work..."
        />

        {/* Job Date */}
        <Input
          label="Job Date"
          name="job_date"
          type="date"
          value={formData.job_date}
          onChange={handleChange}
          required
          error={errors.job_date}
        />

        {/* Divider */}
        <div className="border-t border-gray-300 pt-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Customer Information (Optional)
          </h2>
        </div>

        {/* Customer Name */}
        <Input
          label="Customer Name"
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          placeholder="John Smith"
        />

        {/* Customer Phone */}
        <Input
          label="Customer Phone"
          name="customer_phone"
          type="tel"
          value={formData.customer_phone}
          onChange={handleChange}
          placeholder="07700 900000"
        />

        {/* Customer Email */}
        <Input
          label="Customer Email"
          name="customer_email"
          type="email"
          value={formData.customer_email}
          onChange={handleChange}
          placeholder="john@example.com"
        />

        {/* Divider */}
        <div className="border-t border-gray-300 pt-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Invoice Amount
          </h2>
        </div>

        {/* Labour Amount */}
        <Input
          label="Labour"
          name="labour_amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.labour_amount}
          onChange={handleChange}
          placeholder="500.00"
          helperText="Labour costs"
        />

        {/* Materials Amount */}
        <Input
          label="Materials/Parts"
          name="materials_amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.materials_amount}
          onChange={handleChange}
          placeholder="150.00"
          helperText="Cost of materials and parts"
        />

        {/* Total (calculated) */}
        <div className="bg-amber/10 rounded-xl p-4 border border-amber/30">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-charcoal">Total Invoice Amount:</span>
            <span className="text-2xl font-bold text-charcoal">
              £{((parseFloat(formData.labour_amount) || 0) + (parseFloat(formData.materials_amount) || 0)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-6 space-y-3">
          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating Job...' : 'Create Job'}
          </Button>
          
          <Link href="/">
            <Button
              type="button"
              variant="secondary"
              fullWidth
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
