import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    ShoppingBag, ArrowLeft, DollarSign, TrendingUp, Users, Link2,
    Copy, CheckCheck, ExternalLink, Package, Tag, ChevronRight, Zap,
} from 'lucide-react';

function PublicNavbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Vendora</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Log in</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function CopyButton({ text, label = 'Copy Link' }) {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handle} className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
            {copied ? <CheckCheck size={15} className="text-emerald-400" /> : <Copy size={15} />}
            {copied ? 'Copied!' : label}
        </button>
    );
}

function OrderModal({ product, affiliateCode, onClose }) {
    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/orders', {
                productId: product.id,
                affiliateCode,
                customerName: form.name,
                customerPhone: form.phone,
                customerAddress: form.address
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="card w-full max-w-md text-center p-8">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCheck size={32} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-gray-400 mb-6">Thank you for your purchase.</p>
                    <button onClick={onClose} className="btn-primary w-full">Continue Browsing</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-2">Secure Checkout</h2>
                <p className="text-sm text-gray-500 mb-5">Buying: {product.title} (${product.price.toFixed(2)})</p>
                {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <input className="input" required value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="label">Phone Number</label>
                        <input className="input" required type="tel" value={form.phone} onChange={e => setForm(s => ({ ...s, phone: e.target.value }))} placeholder="(555) 123-4567" />
                    </div>
                    <div>
                        <label className="label">Delivery Address</label>
                        <textarea className="input resize-none h-24" required value={form.address} onChange={e => setForm(s => ({ ...s, address: e.target.value }))} placeholder="123 Main St..." />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Complete Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProductPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myLink, setMyLink] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);

    const refCode = searchParams.get('ref');

    useEffect(() => {
        api.get('/products')
            .then(r => {
                const p = r.data.find(x => x.id === id);
                setProduct(p || null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (user?.role === 'VENDOR') {
            api.get('/affiliates/my-links')
                .then(r => {
                    const link = r.data.find(l => l.productId === id);
                    if (link) setMyLink(link);
                })
                .catch(console.error);
        }
    }, [id, user]);

    const handleGenerate = async () => {
        if (!user) {
            navigate('/register');
            return;
        }
        setGenerating(true);
        setError('');
        try {
            await api.post('/affiliates/generate', { productId: id });
            const r = await api.get('/affiliates/my-links');
            const link = r.data.find(l => l.productId === id);
            setMyLink(link);
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to generate link');
        } finally {
            setGenerating(false);
        }
    };

    const affiliateUrl = myLink ? `${window.location.origin}/go/${myLink.code}` : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
                <Package size={56} className="opacity-20" />
                <p className="text-xl font-medium text-gray-400">Product not found</p>
                <Link to="/marketplace" className="btn-primary">Back to Marketplace</Link>
            </div>
        );
    }

    const commissionAmount = (product.price * product.commissionPct / 100).toFixed(2);

    return (
        <div className="min-h-screen">
            <PublicNavbar />

            <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
                {/* Breadcrumb */}
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
                    <ArrowLeft size={15} /> Back to Marketplace
                </Link>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Left: Image */}
                    <div>
                        {product.imageUrl ? (
                            <div className="rounded-2xl overflow-hidden bg-gray-800 aspect-square">
                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-gray-800 aspect-square flex items-center justify-center">
                                <Package size={72} className="text-gray-700" />
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="badge-merchant">Merchant: {product.merchant?.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-3">{product.title}</h1>
                            <p className="text-gray-400 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="card mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Product Price</p>
                                    <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Commission Rate</p>
                                    <p className="text-3xl font-bold text-emerald-400">{product.commissionPct}%</p>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-400 mb-1">Your earnings per sale</p>
                                <p className="text-2xl font-extrabold text-emerald-400">${commissionAmount}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="card text-center py-4">
                                <Users size={18} className="text-gray-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-white">{product._count?.affiliateLinks || 0}</p>
                                <p className="text-xs text-gray-500">Active affiliates</p>
                            </div>
                            <div className="card text-center py-4">
                                <TrendingUp size={18} className="text-gray-600 mx-auto mb-1" />
                                <p className="text-xl font-bold text-emerald-400">{product.commissionPct}%</p>
                                <p className="text-xs text-gray-500">Commission</p>
                            </div>
                        </div>

                        {/* Buy Button */}
                        <div className="mb-6">
                            <button onClick={() => setShowOrderModal(true)} className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                <ShoppingBag size={20} /> Order Now — ${product.price.toFixed(2)}
                            </button>
                            {refCode && <p className="text-xs text-center text-gray-500 mt-2">You were referred to this product</p>}
                        </div>

                        {/* CTA section */}
                        {!user ? (
                            <div className="card bg-gradient-to-br from-primary-900/40 to-accent-900/20 border-primary-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap size={18} className="text-primary-400" />
                                    <p className="font-semibold text-gray-100">Start earning ${commissionAmount} per sale</p>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">Create a free vendor account to get your affiliate link for this product.</p>
                                <Link to="/register" className="btn-primary w-full text-center flex items-center justify-center gap-2">
                                    Create Free Account <ChevronRight size={16} />
                                </Link>
                                <p className="text-xs text-gray-600 text-center mt-3">Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link></p>
                            </div>
                        ) : user.role === 'VENDOR' ? (
                            myLink ? (
                                <div className="card border-emerald-500/20 bg-emerald-500/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                            <Link2 size={16} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-100">Your affiliate link</p>
                                            <p className="text-xs text-gray-500">{myLink._count?.clicks || 0} clicks recorded</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3 mb-4">
                                        <code className="text-xs text-primary-400 flex-1 truncate">{affiliateUrl}</code>
                                        <CopyButton text={affiliateUrl} />
                                    </div>
                                    <Link to="/dashboard" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                        View all your links <ChevronRight size={14} />
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                                    <button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                                    >
                                        {generating ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                                        ) : (
                                            <><Link2 size={16} /> Get My Affiliate Link</>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-600 text-center mt-2">Your unique tracking link will be created instantly</p>
                                </div>
                            )
                        ) : user.role === 'MERCHANT' ? (
                            <div className="card bg-blue-900/20 border-blue-500/20 text-center py-6">
                                <Tag size={32} className="text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">You are viewing this as a Merchant.</p>
                                <p className="text-gray-500 text-xs mt-1">Switch to a Vendor account to generate affiliate links.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>

            {showOrderModal && (
                <OrderModal
                    product={product}
                    affiliateCode={refCode}
                    onClose={() => setShowOrderModal(false)}
                />
            )}
        </div>
    );
}
