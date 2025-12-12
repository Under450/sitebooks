'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    ownerName: 'Craig Jeavons',
    businessName: 'SiteBooks',
    email: 'info@sitebooks.co.uk',
    phone: '',
    defaultMileageRate: '0.45',
    vatRegistered: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // TODO: Save to Supabase or local storage
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportAllData = () => {
    alert('Data export will download all your jobs, receipts, and mileage entries as a backup file.');
  };

  const handleDeleteAllData = () => {
    if (confirm('⚠️ Are you sure? This will delete ALL your data permanently. This cannot be undone!')) {
      if (confirm('🚨 FINAL WARNING: This will delete everything. Are you absolutely sure?')) {
        alert('Delete functionality will be implemented with proper authentication.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Business Information */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Business Information</h2>
          
          <div className="space-y-4">
            <Input
              label="Owner Name"
              value={settings.ownerName}
              onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
            />

            <Input
              label="Business Name"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="07700 900000"
            />
          </div>
        </section>

        {/* Tax Settings */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Tax & Finance</h2>
          
          <div className="space-y-4">
            <Input
              label="Default Mileage Rate (£ per mile)"
              type="number"
              step="0.01"
              value={settings.defaultMileageRate}
              onChange={(e) => setSettings({ ...settings, defaultMileageRate: e.target.value })}
              helperText="HMRC standard: 45p for first 10,000 miles"
            />

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-charcoal">VAT Registered</p>
                  <p className="text-sm text-gray-600">Are you VAT registered?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.vatRegistered}
                    onChange={(e) => setSettings({ ...settings, vatRegistered: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber"></div>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Data Management</h2>
          
          <div className="space-y-3">
            <Button
              onClick={handleExportAllData}
              fullWidth
              variant="secondary"
            >
              📦 Export All Data (Backup)
            </Button>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>💾 Backup Tip:</strong> Export your data regularly and store it safely. Keep backups for at least 6 years for HMRC compliance.
              </p>
            </div>
          </div>
        </section>

        {/* App Information */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">About</h2>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-semibold text-profit">Connected ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Year:</span>
              <span className="font-semibold">2024/2025</span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-lg font-bold text-cost mb-4">⚠️ Danger Zone</h2>
          
          <Button
            onClick={handleDeleteAllData}
            fullWidth
            variant="danger"
          >
            🗑️ Delete All Data
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            This action cannot be undone
          </p>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            fullWidth
            variant="primary"
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
