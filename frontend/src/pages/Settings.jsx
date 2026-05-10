import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

function Section({ title, children }) {
    return (
        <div className="card">
            <h2 className="text-lg font-semibold text-white mb-5">{title}</h2>
            {children}
        </div>
    );
}

function Alert({ type, message }) {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className={`flex items-center gap-2 text-sm rounded-xl p-3 mb-4 ${isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
            {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {message}
        </div>
    );
}

export default function Settings() {
    const { user, login } = useAuth();

    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileStatus, setProfileStatus] = useState({ loading: false, error: '', success: '' });

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passStatus, setPassStatus] = useState({ loading: false, error: '', success: '' });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileStatus({ loading: true, error: '', success: '' });
        try {
            const res = await api.put('/auth/profile', profile);
            // Update local storage + context
            const stored = JSON.parse(localStorage.getItem('vendora_user') || '{}');
            const updated = { ...stored, ...res.data.user };
            localStorage.setItem('vendora_user', JSON.stringify(updated));
            setProfileStatus({ loading: false, error: '', success: 'Profile updated successfully!' });
        } catch (err) {
            setProfileStatus({ loading: false, error: err.response?.data?.error || 'Update failed', success: '' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassStatus({ loading: true, error: '', success: '' });
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setPassStatus({ loading: false, error: 'Passwords do not match', success: '' });
        }
        if (passwords.newPassword.length < 6) {
            return setPassStatus({ loading: false, error: 'Password must be at least 6 characters', success: '' });
        }
        try {
            await api.put('/auth/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPassStatus({ loading: false, error: '', success: 'Password changed successfully!' });
        } catch (err) {
            setPassStatus({ loading: false, error: err.response?.data?.error || 'Failed to change password', success: '' });
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your profile and security</p>
                </div>

                <div className="space-y-6">
                    {/* Profile */}
                    <Section title="Profile">
                        <Alert type="error" message={profileStatus.error} />
                        <Alert type="success" message={profileStatus.success} />
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="label">Full name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input className="input pl-10" value={profile.name}
                                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Email address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="email" className="input pl-10" value={profile.email}
                                        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={profileStatus.loading} className="btn-primary flex items-center gap-2">
                                    {profileStatus.loading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Save size={16} />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </Section>

                    {/* Password */}
                    <Section title="Change Password">
                        <Alert type="error" message={passStatus.error} />
                        <Alert type="success" message={passStatus.success} />
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="label">Current password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="password" className="input pl-10" placeholder="••••••••"
                                        value={passwords.currentPassword}
                                        onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">New password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="password" className="input pl-10" placeholder="••••••••"
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Confirm new password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="password" className="input pl-10" placeholder="••••••••"
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={passStatus.loading} className="btn-primary flex items-center gap-2">
                                    {passStatus.loading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Lock size={16} />}
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </Section>

                    {/* Account info */}
                    <Section title="Account Info">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Role</span>
                                <span className={`font-semibold ${user?.role === 'MERCHANT' ? 'text-blue-400' : user?.role === 'ADMIN' ? 'text-amber-400' : 'text-purple-400'}`}>
                                    {user?.role}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Member since</span>
                                <span className="text-gray-300">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                            </div>
                        </div>
                    </Section>
                </div>
            </main>
        </div>
    );
}
