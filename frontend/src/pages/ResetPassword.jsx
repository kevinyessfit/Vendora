import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingBag, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="card text-center max-w-md w-full">
                    <p className="text-red-400 mb-4">Invalid or missing reset token.</p>
                    <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password: form.password });
            setDone(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="aurora absolute -inset-[25%] opacity-30 blur-[90px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4">
                        <ShoppingBag size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">New password</h1>
                    <p className="text-gray-400 mt-1">Choose a strong password</p>
                </div>

                {done ? (
                    <div className="card text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Password reset!</h2>
                        <p className="text-gray-400 text-sm">Your password has been updated. You can now sign in.</p>
                        <button onClick={() => navigate('/login')} className="btn-primary w-full">
                            Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="card space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="password" className="label">New password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className="input pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirm" className="label">Confirm password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    value={form.confirm}
                                    onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : 'Reset Password'}
                        </button>
                        <p className="text-center text-sm text-gray-500">
                            Link expired? <Link to="/forgot-password" className="text-primary-400 hover:underline">Request a new one</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
