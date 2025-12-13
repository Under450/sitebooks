'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  business_name?: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adminEmail] = useState('caj@me.com'); // Your admin email

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.email !== adminEmail) {
      // Not admin - redirect to home
      alert('Access denied - Admin only');
      router.push('/');
    } else if (user && user.email === adminEmail) {
      loadUsers();
    }
  }, [user, loading, router, adminEmail]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all users from auth.users (requires service role, so we'll use profiles instead)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://sitebooks.vercel.app/reset-password',
      });

      if (error) throw error;

      alert(`Password reset email sent to ${email}!`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`⚠️ Delete user ${email}? This will delete ALL their data and cannot be undone!`)) return;
    if (!confirm(`🚨 FINAL WARNING: Delete ${email} permanently?`)) return;

    try {
      // Delete profile (cascades to jobs/receipts via foreign keys)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      alert(`User ${email} deleted successfully`);
      loadUsers(); // Reload list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. You may need to use Supabase dashboard.');
    }
  };

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (!user || user.email !== adminEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-charcoal to-charcoal-light text-white sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-charcoal">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">New This Week</p>
            <p className="text-3xl font-bold text-profit">
              {users.filter(u => {
                const created = new Date(u.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* Users List */}
        <div>
          <h2 className="text-lg font-bold text-charcoal mb-4">All Users</h2>
          
          {users.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <p className="text-gray-500">No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-charcoal">{u.business_name || 'No business name'}</p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                    {u.email === adminEmail && (
                      <span className="bg-amber text-white text-xs px-2 py-1 rounded">Admin</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <p>Created: {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>

                  {u.email !== adminEmail && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResetPassword(u.email)}
                        variant="secondary"
                        className="flex-1 text-sm"
                      >
                        🔑 Reset Password
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        variant="danger"
                        className="flex-1 text-sm"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          onClick={loadUsers}
          fullWidth
          variant="secondary"
        >
          🔄 Refresh List
        </Button>
      </div>
    </div>
  );
}
