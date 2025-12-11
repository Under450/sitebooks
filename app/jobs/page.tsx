'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { getCurrentTaxYear } from '@/utils/taxYear';
import type { Job } from '@/types';

// Mock data for now
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    property_address: '15 Oak Street',
    job_type: 'Kitchen Fitting',
    description: 'Full kitchen renovation',
    customer_name: 'John Smith',
    customer_phone: '07700 900000',
    amount_invoiced: 2500,
    payment_status: 'paid',
    payment_date: '2024-12-10',
    job_date: '2024-12-10',
    tax_year: '2024/2025',
    status: 'completed',
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    property_address: '22 Park Lane',
    job_type: 'Bathroom Installation',
    customer_name: 'Sarah Johnson',
    amount_invoiced: 1800,
    payment_status: 'invoiced',
    job_date: '2024-12-08',
    tax_year: '2024/2025',
    status: 'completed',
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    property_address: '8 Mill Road',
    job_type: 'Electrical Work',
    description: 'Rewiring',
    amount_invoiced: 3200,
    payment_status: 'paid',
    payment_date: '2024-12-05',
    job_date: '2024-12-05',
    tax_year: '2024/2025',
    status: 'completed',
  },
];

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const taxYear = getCurrentTaxYear();

  useEffect(() => {
    // TODO: Load jobs from Supabase
    // For now, use mock data
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setLoading(false);
    }, 500);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-profit';
      case 'invoiced':
        return 'bg-amber';
      case 'unpaid':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'invoiced':
        return 'Invoiced';
      case 'unpaid':
        return 'Unpaid';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl">←</Link>
            <div>
              <h1 className="text-xl font-bold">Jobs</h1>
              <p className="text-sm text-white/80">{taxYear.label}</p>
            </div>
          </div>
          <Link href="/jobs/new">
            <button className="w-10 h-10 bg-amber rounded-full flex items-center justify-center text-2xl">
              +
            </button>
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-amber text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-amber text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Active ({jobs.filter(j => j.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-amber text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Completed ({jobs.filter(j => j.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-6 py-6 space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No jobs found</p>
            <Link href="/jobs/new">
              <button className="px-6 py-3 bg-amber text-white rounded-xl font-semibold">
                Add Your First Job
              </button>
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber transition-colors active:scale-98">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-charcoal text-lg">
                      {job.property_address}
                    </h3>
                    <p className="text-sm text-gray-600">{job.job_type}</p>
                    {job.customer_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        {job.customer_name}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs text-white px-3 py-1 rounded-lg font-bold uppercase ${getPaymentStatusColor(
                      job.payment_status
                    )}`}
                  >
                    {getPaymentStatusText(job.payment_status)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-600">Amount: </span>
                    <span className="font-bold text-charcoal">
                      {formatCurrency(job.amount_invoiced)}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {formatDate(job.job_date)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
