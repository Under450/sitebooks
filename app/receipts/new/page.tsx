'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SUPPLIERS, RECEIPT_CATEGORIES } from '@/types';
import { formatDateForInput, calculateVAT } from '@/utils/formatting';

export default function NewReceiptPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    job_id: '',
    date: formatDateForInput(new Date()),
    supplier: '',
    custom_supplier: '',
    amount: '',
    vat_amount: '',
    category: 'materials' as const,
    items_description: '',
    notes: '',
  });

  // Mock jobs for dropdown
  const mockJobs = [
    { value: '1', label: '15 Oak Street - Kitchen Fitting' },
    { value: '2', label: '22 Park Lane - Bathroom Installation' },
    { value: '3', label: '8 Mill Road - Electrical Work' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate VAT when amount changes
    if (name === 'amount' && value) {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        const vat = calculateVAT(amount);
        setFormData((prev) => ({ ...prev, vat_amount: vat.toFixed(2) }));
      }
    }
    
    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Process with OCR
    setProcessing(true);
    try {
      // TODO: Implement Tesseract OCR
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR results
      alert('OCR processing complete! Data extracted (this is a demo)');
      
    } catch (error) {
      console.error('OCR error:', error);
      alert('Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.job_id) {
      newErrors.job_id = 'Please select a job';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }
    
    if (formData.supplier === 'Other' && !formData.custom_supplier.trim()) {
      newErrors.custom_supplier = 'Please specify the supplier';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Upload to Supabase Storage and save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Receipt data:', formData);
      
      alert('Receipt added successfully!');
      router.push(`/jobs/${formData.job_id}`);
      
    } catch (error) {
      console.error('Error adding receipt:', error);
      alert('Failed to add receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const supplierOptions = SUPPLIERS.map(supplier => ({
    value: supplier,
    label: supplier,
  }));

  const categoryOptions = RECEIPT_CATEGORIES.map(category => ({
    value: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Add Receipt</h1>
        </div>
      </header>

      {/* Camera/Upload Section */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="max-w-full h-auto rounded-lg mx-auto"
                style={{ maxHeight: '300px' }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📸</div>
              <Button
                type="button"
                onClick={handleCameraClick}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Take Photo / Upload'}
              </Button>
              <p className="text-sm text-gray-500">
                Scan receipt to auto-extract data
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        {/* Select Job */}
        <Select
          label="Job"
          name="job_id"
          value={formData.job_id}
          onChange={handleChange}
          options={mockJobs}
          required
          error={errors.job_id}
        />

        {/* Date */}
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          error={errors.date}
        />

        {/* Supplier */}
        <Select
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          options={supplierOptions}
          required
          error={errors.supplier}
        />

        {/* Custom Supplier */}
        {formData.supplier === 'Other' && (
          <Input
            label="Supplier Name"
            name="custom_supplier"
            value={formData.custom_supplier}
            onChange={handleChange}
            placeholder="Enter supplier name"
            required
            error={errors.custom_supplier}
          />
        )}

        {/* Amount */}
        <Input
          label="Total Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={handleChange}
          placeholder="50.00"
          required
          error={errors.amount}
        />

        {/* VAT Amount */}
        <Input
          label="VAT Amount"
          name="vat_amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.vat_amount}
          onChange={handleChange}
          placeholder="Auto-calculated"
          helperText="Auto-calculated at 20%"
        />

        {/* Category */}
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
          required
        />

        {/* Items Description */}
        <Textarea
          label="What Was Purchased?"
          name="items_description"
          value={formData.items_description}
          onChange={handleChange}
          placeholder="e.g., Kitchen units, hinges, screws"
        />

        {/* Notes */}
        <Textarea
          label="Notes (Optional)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional notes..."
        />

        {/* Submit Buttons */}
        <div className="pt-6 space-y-3">
          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Adding Receipt...' : 'Add Receipt'}
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
