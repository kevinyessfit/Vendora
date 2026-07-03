import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background — animated aurora */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="aurora absolute -inset-[25%] opacity-30 blur-[90px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4">
                        <ShoppingBag size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-400 mt-1">Sign in to your Vendora account</p>
                </div>

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
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="label !mb-0">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                autoComplete="current-password"
                                className="input pl-10 pr-10"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                aria-label={showPass ? 'Hide password' : 'Show password'}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Sign In'}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </form>

            </div>
        </div>
    );
}
