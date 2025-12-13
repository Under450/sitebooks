'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    defaultMileageRate: '0.45',
    vatRegistered: false,
    vatNumber: '',
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (data) {
        setSettings({
          businessName: data.business_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          defaultMileageRate: data.default_mileage_rate?.toString() || '0.45',
          vatRegistered: data.vat_registered || false,
          vatNumber: data.vat_number || '',
        });
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // Update profile
      await supabase
        .from('profiles')
        .update({
          logo_url: data.publicUrl,
          logo_path: fileName,
        })
        .eq('id', user.id);

      setLogoUrl(data.publicUrl);
      alert('✅ Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: settings.businessName,
          phone: settings.phone,
          address: settings.address,
          default_mileage_rate: parseFloat(settings.defaultMileageRate),
          vat_registered: settings.vatRegistered,
          vat_number: settings.vatNumber,
        })
        .eq('id', user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
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
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Logo Upload */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Business Logo</h2>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            {logoUrl ? (
              <div className="space-y-4">
                <img 
                  src={logoUrl} 
                  alt="Business logo" 
                  className="max-w-xs max-h-32 object-contain mx-auto"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  fullWidth
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Change Logo'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-6xl">🏢</div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-gray-500">
                  PNG, JPG or SVG (max 2MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </section>

        {/* Business Information */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Business Information</h2>
          
          <div className="space-y-4">
            <Input
              label="Business Name"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              value={settings.email}
              disabled
              helperText="Cannot be changed"
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="07700 900000"
            />

            <Input
              label="Address (Optional)"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Your business address"
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
              
              {settings.vatRegistered && (
                <div className="mt-4">
                  <Input
                    label="VAT Number"
                    value={settings.vatNumber}
                    onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                    placeholder="GB123456789"
                  />
                </div>
              )}
            </div>
          </div>
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

        {/* Account Actions */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Account</h2>
          
          {user?.email === 'caj@me.com' && (
            <Link href="/admin">
              <Button
                fullWidth
                variant="primary"
                className="mb-3"
              >
                👑 Admin Panel
              </Button>
            </Link>
          )}
          
          <Button
            onClick={handleLogout}
            fullWidth
            variant="secondary"
          >
            🚪 Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
