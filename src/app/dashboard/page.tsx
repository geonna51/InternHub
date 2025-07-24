"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '../../lib/database.types';

// Use database types
type Application = Database['public']['Tables']['applications']['Row'] & {
  reminders?: Database['public']['Tables']['reminders']['Row'][];
};
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // User state
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [company, setCompany] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [referral, setReferral] = useState<boolean>(false);
  const [referredBy, setReferredBy] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  
  // App state
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'analytics'>('add');
  const [selectedApps, setSelectedApps] = useState<number[]>([]);
  const [showReminderPanel, setShowReminderPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    email: '',
    reminderEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-500' },
    { value: 'under-review', label: 'Under Review', color: 'bg-yellow-500' },
    { value: 'online-assessment', label: 'Online Assessment', color: 'bg-purple-500' },
    { value: 'phone-screen', label: 'Phone Screen', color: 'bg-indigo-500' },
    { value: 'technical-interview', label: 'Technical Interview', color: 'bg-cyan-500' },
    { value: 'final-interview', label: 'Final Interview', color: 'bg-orange-500' },
    { value: 'offer', label: 'Offer Received', color: 'bg-green-500' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-500' },
  ] as const;

  // Load user and data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser({ id: user.id, email: user.email || '' });
        
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setSettings({
            email: profileData.email,
            reminderEmail: profileData.reminder_email || '',
            newPassword: '',
            confirmPassword: ''
          });
        }
        
        // Load applications
        await loadApplications(user.id);
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [router, supabase]); // loadApplications is not included because it's defined after this useEffect

  const loadApplications = async (userId: string) => {
    const { data: applicationsData, error } = await supabase
      .from('applications')
      .select(`
        *,
        reminders(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading applications:', error);
    } else {
      setApplications(applicationsData || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { company, date, referral, referredBy, applicationLink });
    
    if (!user) return;
    
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          company,
          application_date: date?.toISOString().split('T')[0] || null,
          referral,
          referred_by: referredBy || null,
          application_link: applicationLink || null,
          status: 'applied',
          notes: ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        alert('Error creating application: ' + error.message);
        return;
      }

      console.log('Application created successfully!');
      // Reload applications
      await loadApplications(user.id);
      
      // Reset form
      setCompany('');
      setDate(null);
      setReferral(false);
      setReferredBy('');
      setApplicationLink('');
      setActiveTab('list');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application: ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAppSelection = (index: number) => {
    setSelectedApps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAllApps = () => {
    setSelectedApps(applications.map((_, i) => i));
  };

  const clearSelection = () => {
    setSelectedApps([]);
  };

  const setReminderForSelected = async (timeOption: string, customDate?: Date) => {
    if (!user) return;
    
    const now = new Date();
    let reminderDate: Date;

    switch (timeOption) {
      case '1week':
        reminderDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '2weeks':
        reminderDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case '3weeks':
        reminderDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        reminderDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      case '2months':
        reminderDate = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
        break;
      case 'custom':
        reminderDate = customDate || now;
        break;
      default:
        return;
    }

    try {
      // Create reminders for selected applications
      const remindersToCreate = selectedApps.map(index => ({
        user_id: user.id,
        application_id: applications[index].id,
        reminder_date: reminderDate.toISOString()
      }));

      const { error } = await supabase
        .from('reminders')
        .insert(remindersToCreate);

      if (error) {
        console.error('Error creating reminders:', error);
        return;
      }

      // Reload applications to show new reminders
      await loadApplications(user.id);
    } catch (error) {
      console.error('Error setting reminders:', error);
    }

    setSelectedApps([]);
    setShowReminderPanel(false);
  };

  const updateStatusForSelected = async (newStatus: Application['status']) => {
    if (!user) return;
    
    try {
      const applicationsToUpdate = selectedApps.map(index => applications[index].id);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .in('id', applicationsToUpdate);

      if (error) {
        console.error('Error updating status:', error);
        return;
      }

      // Reload applications
      await loadApplications(user.id);
    } catch (error) {
      console.error('Error updating status:', error);
    }
    
    setSelectedApps([]);
    setShowStatusPanel(false);
  };

  const deleteSelectedApplications = async () => {
    if (!user || selectedApps.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedApps.length} application(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      const applicationsToDelete = selectedApps.map(index => applications[index].id);
      
      const { error } = await supabase
        .from('applications')
        .delete()
        .in('id', applicationsToDelete);

      if (error) {
        console.error('Error deleting applications:', error);
        alert('Error deleting applications: ' + error.message);
        return;
      }

      // Reload applications
      await loadApplications(user.id);
      alert(`Successfully deleted ${selectedApps.length} application(s)`);
    } catch (error) {
      console.error('Error deleting applications:', error);
      alert('Error deleting applications: ' + error);
    }
    
    setSelectedApps([]);
  };

  const deleteSingleApplication = async (applicationId: string, companyName: string) => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the application for ${companyName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application: ' + error.message);
        return;
      }

      // Reload applications
      await loadApplications(user.id);
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Error deleting application: ' + error);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: settings.email,
          reminder_email: settings.reminderEmail || null
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }

      // Update password if provided
      if (settings.newPassword && settings.newPassword === settings.confirmPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: settings.newPassword
        });

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          return;
        }
      }

      // Reload applications to refresh data
      await loadApplications(user.id);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
    
    setShowSettings(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Analytics data preparation
  const getStatusCounts = () => {
    // Color mapping for chart colors (hex values)
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': '#3B82F6',
      'bg-yellow-500': '#EAB308', 
      'bg-purple-500': '#A855F7',
      'bg-indigo-500': '#6366F1',
      'bg-cyan-500': '#06B6D4',
      'bg-orange-500': '#F97316',
      'bg-green-500': '#10B981',
      'bg-red-500': '#EF4444',
      'bg-gray-500': '#6B7280',
    };

    const counts = statusOptions.map(status => ({
      name: status.label,
      value: applications.filter(app => app.status === status.value).length,
      color: colorMap[status.color] || '#6B7280',
    }));
    return counts.filter(item => item.value > 0);
  };



  return (
    <div className="min-h-screen px-6 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-5xl font-black gradient-text mb-3 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-medium">{profile?.email}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 btn-glass rounded-xl text-gray-400 hover:text-gray-300 transition-smooth"
              title="Settings"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm btn-glass rounded-xl text-red-400 hover:text-red-300 transition-smooth"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 animate-slide-up">
          <nav className="glass-card rounded-2xl p-2 inline-flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-smooth ${
                activeTab === 'add'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Add Application
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-smooth ${
                activeTab === 'list'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              My Applications ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-smooth ${
                activeTab === 'analytics'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'add' ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Add New Application</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-3">
                    Company Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Enter company name"
                    className="w-full px-5 py-4 glass rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-smooth"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-3">
                    Application Date
                  </label>
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select application date"
                    className="w-full px-5 py-4 glass rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Referral Received?
                  </label>
                  <select
                    className="w-full px-5 py-4 glass rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-smooth"
                    value={referral.toString()}
                    onChange={(e) => setReferral(e.target.value === 'true')}
                  >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {referral && (
                <div>
                  <label htmlFor="referredBy" className="block text-sm font-medium text-gray-300 mb-3">
                    Referred By
                  </label>
                  <input
                    id="referredBy"
                    type="text"
                    placeholder="Who referred you?"
                    className="w-full px-5 py-4 glass rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-smooth"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                  />
                </div>
              )}

                <div>
                  <label htmlFor="applicationLink" className="block text-sm font-medium text-gray-300 mb-3">
                    Application Link <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="applicationLink"
                    type="url"
                    placeholder="https://company.com/careers/job-id"
                    className="w-full px-5 py-4 glass rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-smooth"
                    value={applicationLink}
                    onChange={(e) => setApplicationLink(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 btn-glass rounded-xl font-semibold text-white transition-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  disabled={submitting || !company.trim()}
                >
                  {submitting ? 'Adding...' : 'Add Application'}
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === 'list' ? (
          <div>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No applications yet</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first internship application.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Application
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Bulk Actions Bar */}
                {applications.length > 0 && (
                  <div className="md:col-span-2 lg:col-span-3 bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">
                          {selectedApps.length} of {applications.length} selected
                        </span>
                        <button
                          onClick={selectAllApps}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          onClick={clearSelection}
                          className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      {selectedApps.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setShowStatusPanel(!showStatusPanel)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Update Status ({selectedApps.length})
                          </button>
                          <button
                            onClick={() => setShowReminderPanel(!showReminderPanel)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Set Reminders ({selectedApps.length})
                          </button>
                          <button
                            onClick={deleteSelectedApplications}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete ({selectedApps.length})
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Update Panel */}
                    {showStatusPanel && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-300">Update status for {selectedApps.length} selected application{selectedApps.length !== 1 ? 's' : ''}:</h4>
                          <button
                            onClick={() => setShowStatusPanel(false)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {statusOptions.map((status) => (
                            <button
                              key={status.value}
                              onClick={() => updateStatusForSelected(status.value)}
                              className={`px-4 py-3 text-sm text-white rounded-lg transition-all hover:scale-105 hover:shadow-lg ${status.color} flex items-center justify-center gap-2 font-medium`}
                            >
                              <div className="w-2 h-2 rounded-full bg-white opacity-75"></div>
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Reminder Options Panel */}
                    {showReminderPanel && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Set reminder for selected applications:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                          <button
                            onClick={() => setReminderForSelected('1week')}
                            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            1 Week
                          </button>
                          <button
                            onClick={() => setReminderForSelected('2weeks')}
                            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            2 Weeks
                          </button>
                          <button
                            onClick={() => setReminderForSelected('3weeks')}
                            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            3 Weeks
                          </button>
                          <button
                            onClick={() => setReminderForSelected('1month')}
                            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            1 Month
                          </button>
                          <button
                            onClick={() => setReminderForSelected('2months')}
                            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            2 Months
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <DatePicker
                            selected={null}
                            onChange={(date) => date && setReminderForSelected('custom', date)}
                            placeholderText="Or pick custom date"
                            className="px-3 py-2 text-xs bg-gray-700 border border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            minDate={new Date()}
                            showTimeSelect
                            dateFormat="MM/dd/yyyy h:mm aa"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {applications.map((app, idx) => (
                   <div 
                     key={idx} 
                     className={`glass-card rounded-2xl p-6 cursor-pointer transition-smooth hover:scale-[1.02] ${
                       selectedApps.includes(idx) 
                         ? 'border-blue-500/50 bg-blue-500/10' 
                         : 'hover:bg-white/5'
                     }`}
                     onClick={() => toggleAppSelection(idx)}
                   >
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                           selectedApps.includes(idx) 
                             ? 'bg-blue-600 border-blue-600' 
                             : 'border-gray-500'
                         }`}>
                           {selectedApps.includes(idx) && (
                             <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           )}
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-lg font-semibold text-white">{app.company}</h3>
                             {app.application_link && (
                               <a
                                 href={app.application_link}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-400 hover:text-blue-300 transition-colors"
                                 onClick={(e) => e.stopPropagation()}
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                 </svg>
                               </a>
                             )}
                           </div>
                           <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusInfo(app.status).color}`}>
                             {getStatusInfo(app.status).label}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             deleteSingleApplication(app.id, app.company);
                           }}
                           className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                           title={`Delete ${app.company} application`}
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                         <span className="text-xs text-gray-400">
                           #{idx + 1}
                         </span>
                       </div>
                     </div>
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-gray-400">Date:</span>
                         <span className="text-gray-300">{app.application_date || 'Not set'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-400">Referral:</span>
                         <span className={`font-medium ${app.referral ? 'text-green-400' : 'text-gray-300'}`}>
                           {app.referral ? 'Yes' : 'No'}
                         </span>
                       </div>
                       {app.referral && app.referred_by && (
                         <div className="flex justify-between">
                           <span className="text-gray-400">Referred by:</span>
                           <span className="text-gray-300">{app.referred_by}</span>
                         </div>
                       )}
                       {app.reminders && app.reminders.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Reminders:</span>
                            </div>
                            {app.reminders.map((reminder, rIdx) => (
                              <div key={rIdx} className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${reminder.email_sent ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {new Date(reminder.reminder_date).toLocaleDateString()} {new Date(reminder.reminder_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${reminder.email_sent ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                  {reminder.email_sent ? 'Sent' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   </div>
                  ))}
               </div>
            )}
          </div>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Nothing here yet</h3>
                <p className="text-gray-400 mb-4">Add your first application to see your progress.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Application
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Application Pipeline Overview */}
                <div className="glass-card rounded-3xl p-8 animate-fade-in">
                  <h3 className="text-2xl font-semibold text-white mb-8">Application Pipeline</h3>
                  
                  {/* Pipeline stages */}
                  {(() => {
                    const allStages = [
                      { key: 'applied', label: 'Applied', color: '#3B82F6', icon: '📝' },
                      { key: 'under-review', label: 'Under Review', color: '#EAB308', icon: '👀' },
                      { key: 'online-assessment', label: 'Assessment', color: '#A855F7', icon: '💻' },
                      { key: 'phone-screen', label: 'Phone Screen', color: '#6366F1', icon: '📞' },
                      { key: 'technical-interview', label: 'Technical', color: '#06B6D4', icon: '🧑‍💻' },
                      { key: 'final-interview', label: 'Final Round', color: '#F97316', icon: '🎯' },
                      { key: 'offer', label: 'Offer', color: '#10B981', icon: '🎉' },
                      { key: 'rejected', label: 'Rejected', color: '#EF4444', icon: '❌' },
                      { key: 'withdrawn', label: 'Withdrawn', color: '#6B7280', icon: '↩️' }
                    ];

                    // Filter to only stages that have applications
                    const activeStages = allStages.filter(stage => {
                      return applications.filter(app => app.status === stage.key).length > 0;
                    });

                    // Determine dynamic grid classes based on number of active stages
                    const getGridCols = (count: number) => {
                      if (count === 1) return 'grid-cols-1';
                      if (count === 2) return 'grid-cols-2';
                      if (count === 3) return 'grid-cols-3';
                      if (count === 4) return 'grid-cols-2 md:grid-cols-4';
                      if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
                      if (count === 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
                      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
                    };

                    return (
                      <div className={`grid ${getGridCols(activeStages.length)} gap-4 mb-6`}>
                        {activeStages.map((stage) => {
                          const count = applications.filter(app => app.status === stage.key).length;
                          const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
                          
                          return (
                            <div key={stage.key} className="text-center">
                              <div 
                                className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2"
                                style={{ backgroundColor: stage.color }}
                              >
                                <span className="text-xl">{stage.icon}</span>
                              </div>
                              <div className="text-white font-semibold text-lg">{count}</div>
                              <div className="text-xs text-gray-400 mb-1">{stage.label}</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round((applications.filter(app => app.status === 'offer').length / Math.max(applications.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.round((applications.filter(app => ['technical-interview', 'final-interview'].includes(app.status)).length / Math.max(applications.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Interview Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.round((applications.filter(app => ['online-assessment', 'phone-screen'].includes(app.status)).length / Math.max(applications.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Assessment Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {Math.round((applications.filter(app => app.status === 'rejected').length / Math.max(applications.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Rejection Rate</div>
                    </div>
                  </div>
                </div>
                
                {/* Status Distribution */}
                <div className="glass-card rounded-3xl p-8 animate-slide-up">
                  <h3 className="text-2xl font-semibold text-white mb-6">Status Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getStatusCounts()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {getStatusCounts().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            color: '#F3F4F6'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {getStatusCounts().map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-gray-300">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-6 text-center transition-smooth hover:scale-105">
                    <div className="text-3xl font-bold text-blue-400">{applications.length}</div>
                    <div className="text-sm text-gray-400 mt-2">Total Applications</div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 text-center transition-smooth hover:scale-105">
                    <div className="text-3xl font-bold text-green-400">
                      {applications.filter(app => app.status === 'offer').length}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">Offers Received</div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 text-center transition-smooth hover:scale-105">
                    <div className="text-3xl font-bold text-yellow-400">
                      {applications.filter(app => ['under-review', 'online-assessment', 'phone-screen', 'technical-interview', 'final-interview'].includes(app.status)).length}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">In Progress</div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 text-center transition-smooth hover:scale-105">
                    <div className="text-3xl font-bold text-purple-400">
                      {applications.filter(app => app.referral).length}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">With Referrals</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                {/* Account Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reminderEmail" className="block text-sm font-medium text-gray-300 mb-2">
                        Reminder Email Address
                      </label>
                      <input
                        id="reminderEmail"
                        type="email"
                        placeholder="reminders@email.com (optional)"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.reminderEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, reminderEmail: e.target.value }))}
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Leave blank to use your main email for reminders
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Settings */}
                <div className="border-t border-gray-600 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.newPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                      {settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
