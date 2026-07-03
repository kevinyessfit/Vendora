import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingBag, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
                    <h1 className="text-3xl font-bold text-white">Forgot password?</h1>
                    <p className="text-gray-400 mt-1">We'll send you a reset link</p>
                </div>

                {sent ? (
                    <div className="card text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Check your email</h2>
                        <p className="text-gray-400 text-sm">
                            If an account exists for <strong className="text-gray-200">{email}</strong>, we've sent a password reset link.
                        </p>
                        <p className="text-gray-500 text-xs">The link expires in 1 hour. Check your spam folder if you don't see it.</p>
                        <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="card space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="label">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : 'Send Reset Link'}
                        </button>
                        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
