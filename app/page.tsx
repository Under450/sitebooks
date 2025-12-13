'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentTaxYear, type TaxYearInfo } from '@/utils/taxYear';
import { formatCurrency } from '@/utils/formatting';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [taxYear, setTaxYear] = useState<TaxYearInfo | null>(null);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalCosts: 0,
    totalProfit: 0,
    jobCount: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const currentTaxYear = getCurrentTaxYear();
    setTaxYear(currentTaxYear);
    
    // TODO: Load stats from database
    // For now, using placeholder data
    setStats({
      totalIncome: 89450,
      totalCosts: 28320,
      totalProfit: 61130,
      jobCount: 47,
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!taxYear) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white">
        <div className="px-6 py-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">SB</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SiteBooks</h1>
          </div>
          
          {/* Tax Year */}
          <p className="text-white/90 text-sm ml-15">
            Tax Year {taxYear.label}
          </p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Year Summary
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
              Income
            </p>
            <p className="text-xl font-bold text-amber">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
              Costs
            </p>
            <p className="text-xl font-bold text-cost">
              {formatCurrency(stats.totalCosts)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
              Profit
            </p>
            <p className="text-xl font-bold text-profit">
              {formatCurrency(stats.totalProfit)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">
              Jobs
            </p>
            <p className="text-xl font-bold text-charcoal">
              {stats.jobCount}
            </p>
          </div>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="px-6 py-6">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Add New Job */}
          <Link href="/jobs/new">
            <div className="tile-in bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber transition-colors active:scale-95 shadow-sm">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-base font-bold text-charcoal mb-1">Add New</h3>
              <p className="text-sm text-gray-600">Job</p>
            </div>
          </Link>

          {/* Add Receipt */}
          <Link href="/receipts/new">
            <div className="tile-in bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber transition-colors active:scale-95 shadow-sm" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-3">📸</div>
              <h3 className="text-base font-bold text-charcoal mb-1">Add</h3>
              <p className="text-sm text-gray-600">Receipt</p>
            </div>
          </Link>

          {/* View Jobs */}
          <Link href="/jobs">
            <div className="tile-in bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber transition-colors active:scale-95 shadow-sm" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-base font-bold text-charcoal mb-1">View</h3>
              <p className="text-sm text-gray-600">Jobs</p>
            </div>
          </Link>

          {/* Export Report */}
          <Link href="/export">
            <div className="tile-in bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber transition-colors active:scale-95 shadow-sm" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-base font-bold text-charcoal mb-1">Export</h3>
              <p className="text-sm text-gray-600">Report</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Jobs Preview */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Recent Jobs
          </h2>
          <Link href="/jobs" className="text-sm text-amber font-semibold">
            View All →
          </Link>
        </div>

        {/* Placeholder - will be replaced with real jobs */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-charcoal">15 Oak Street</h3>
                <p className="text-sm text-gray-600">Kitchen Fitting</p>
              </div>
              <span className="text-xs bg-profit text-white px-2 py-1 rounded-lg font-bold uppercase">
                Paid
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-600">Income: <span className="font-semibold text-charcoal">£2,500</span></span>
              <span className="text-profit font-bold">+£1,705</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex flex-col items-center gap-1 text-amber">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium">Reports</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
