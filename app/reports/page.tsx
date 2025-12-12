'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatting';
import { getCurrentTaxYear, getTaxYearLabel } from '@/utils/taxYear';
import { Button } from '@/components/ui/Button';

interface TaxYearSummary {
  tax_year: string;
  total_income: number;
  total_costs: number;
  total_profit: number;
  job_count: number;
  total_vat: number;
}

export default function ReportsPage() {
  const [summaries, setSummaries] = useState<TaxYearSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const currentTaxYear = getCurrentTaxYear();

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      // TODO: Load from Supabase
      // Mock data for now
      const mockSummaries: TaxYearSummary[] = [
        {
          tax_year: '2024/2025',
          total_income: 89450,
          total_costs: 28320,
          total_profit: 61130,
          job_count: 47,
          total_vat: 4720,
        },
        {
          tax_year: '2023/2024',
          total_income: 76200,
          total_costs: 24100,
          total_profit: 52100,
          job_count: 39,
          total_vat: 4018,
        },
      ];
      setSummaries(mockSummaries);
      setSelectedYear(mockSummaries[0]?.tax_year || currentTaxYear.label);
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const year = summaries.find(s => s.tax_year === selectedYear);
    if (!year) return;

    // Create CSV content
    const csv = `Tax Year,Income,Costs,Profit,VAT,Jobs\n${year.tax_year},${year.total_income},${year.total_costs},${year.total_profit},${year.total_vat},${year.job_count}`;
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitebooks-${year.tax_year.replace('/', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    alert('PDF export coming soon! For now, use CSV or take screenshots.');
  };

  const selectedSummary = summaries.find(s => s.tax_year === selectedYear);

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
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Reports</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Tax Year Selector */}
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">
            Tax Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber focus:outline-none"
          >
            {summaries.map((summary) => (
              <option key={summary.tax_year} value={summary.tax_year}>
                {summary.tax_year}
              </option>
            ))}
          </select>
        </div>

        {selectedSummary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-profit">
                  {formatCurrency(selectedSummary.total_income)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Costs</p>
                <p className="text-2xl font-bold text-cost">
                  {formatCurrency(selectedSummary.total_costs)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                <p className="text-2xl font-bold text-profit">
                  {formatCurrency(selectedSummary.total_profit)}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Jobs Completed</p>
                <p className="text-2xl font-bold text-charcoal">
                  {selectedSummary.job_count}
                </p>
              </div>
            </div>

            {/* VAT Summary */}
            <div className="bg-amber/10 rounded-xl p-4 border border-amber/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-charcoal/70 mb-1">Total VAT Paid on Expenses</p>
                  <p className="text-xl font-bold text-charcoal">
                    {formatCurrency(selectedSummary.total_vat)}
                  </p>
                </div>
                <div className="text-3xl">🧾</div>
              </div>
              <p className="text-xs text-charcoal/60 mt-2">
                Available for reclaim if you become VAT registered
              </p>
            </div>

            {/* Profit Margin */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-charcoal">
                  {((selectedSummary.total_profit / selectedSummary.total_income) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-profit h-3 rounded-full transition-all"
                  style={{
                    width: `${(selectedSummary.total_profit / selectedSummary.total_income) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3 pt-4">
              <h2 className="text-lg font-bold text-charcoal">Export Data</h2>
              
              <Button
                onClick={handleExportCSV}
                fullWidth
                variant="primary"
              >
                📊 Export as CSV (Excel)
              </Button>

              <Button
                onClick={handleExportPDF}
                fullWidth
                variant="secondary"
              >
                📄 Export as PDF (Coming Soon)
              </Button>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>💡 HMRC Tip:</strong> Keep these records for at least 6 years after the tax year ends. Export regularly and store backups safely.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-charcoal mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average job value:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSummary.total_income / selectedSummary.job_count)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average cost per job:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSummary.total_costs / selectedSummary.job_count)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average profit per job:</span>
                  <span className="font-semibold text-profit">
                    {formatCurrency(selectedSummary.total_profit / selectedSummary.job_count)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {summaries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No data yet</p>
            <p className="text-sm text-gray-400">
              Start adding jobs and receipts to see your reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
