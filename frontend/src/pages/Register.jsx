import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Mail, Lock, User, Store, Link2, Eye, EyeOff } from 'lucide-react';

const ROLES = [
    {
        id: 'MERCHANT',
        label: 'Merchant',
        icon: Store,
        description: 'List products and find affiliates',
        color: 'from-blue-600 to-blue-500',
        border: 'border-blue-500/40 bg-blue-500/10',
        active: 'ring-2 ring-blue-500 border-blue-500/60 bg-blue-500/15',
    },
    {
        id: 'VENDOR',
        label: 'Vendor',
        icon: Link2,
        description: 'Promote products and earn commissions',
        color: 'from-purple-600 to-purple-500',
        border: 'border-purple-500/40 bg-purple-500/10',
        active: 'ring-2 ring-purple-500 border-purple-500/60 bg-purple-500/15',
    },
];

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VENDOR' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.role);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl shadow-primary-500/40 mb-4">
                        <ShoppingBag size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Join Vendora</h1>
                    <p className="text-gray-400 mt-1">Create your free account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Role selection */}
                    <div>
                        <span className="label">I want to join as</span>
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES.map(role => {
                                const Icon = role.icon;
                                const isActive = form.role === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, role: role.id }))}
                                        className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${isActive ? role.active : `${role.border} hover:border-gray-600`
                                            }`}
                                    >
                                        <div className={`w-8 h-8 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center`}>
                                            <Icon size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-100">{role.label}</p>
                                            <p className="text-xs text-gray-500">{role.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="label">Full name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input id="name" type="text" autoComplete="name" className="input pl-10" placeholder="Jane Doe"
                                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="label">Email address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input id="email" type="email" autoComplete="email" className="input pl-10" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="label">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" className="input pl-10 pr-10" placeholder="••••••••"
                                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                aria-label={showPass ? 'Hide password' : 'Show password'}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
