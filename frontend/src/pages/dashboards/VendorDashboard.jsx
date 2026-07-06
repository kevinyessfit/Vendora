import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { Link2, MousePointerClick, DollarSign, TrendingUp, Copy, CheckCheck, ShoppingBag, ExternalLink, Share2, Wallet, X, AlertCircle } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="stat-card">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    );
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handle} title="Copy link" aria-label={copied ? 'Link copied' : 'Copy link'} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-primary-400 transition-colors">
            {copied ? <CheckCheck size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
    );
}

function PayoutModal({ available, onClose, onSuccess }) {
    const [form, setForm] = useState({ method: 'PayPal', details: '', amount: Math.round(available) });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (parseFloat(form.amount) <= 0) return setError('Amount must be greater than 0');
        if (parseFloat(form.amount) > available) return setError(`Max available: ${formatCurrency(available)}`);
        setLoading(true);
        try {
            await api.post('/payouts/request', form);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="card w-full max-w-md relative">
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"><X size={20} /></button>
                <h2 className="text-xl font-bold mb-1">Request Payout</h2>
                <p className="text-sm text-gray-500 mb-5">Available balance: <span className="text-emerald-400 font-semibold">{formatCurrency(available)}</span></p>
                {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="payout-amount" className="label">Amount (FCFA)</label>
                        <input id="payout-amount" type="number" className="input" step="1" min="1" max={available} value={form.amount}
                            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                    <div>
                        <label htmlFor="payout-method" className="label">Payment Method</label>
                        <select id="payout-method" className="input" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                            <option>PayPal</option>
                            <option>Bank Transfer</option>
                            <option>Mobile Money</option>
                            <option>Crypto (USDT)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="payout-details" className="label">Payment Details</label>
                        <input id="payout-details" className="input" placeholder="e.g. your@paypal.com or account number"
                            value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VendorDashboard() {
    const [products, setProducts] = useState([]);
    const [myLinks, setMyLinks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [earningsData, setEarningsData] = useState({ summary: {}, earnings: [], payoutRequests: [] });
    const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);
    const [tab, setTab] = useState('explore');
    const [showPayoutModal, setShowPayoutModal] = useState(false);

    const fetchAll = () => Promise.all([
        api.get('/products').then(r => setProducts(r.data)),
        api.get('/affiliates/my-links').then(r => setMyLinks(r.data)),
        api.get('/affiliates/stats').then(r => setStats(r.data)),
        api.get('/orders/vendor').then(r => setOrders(r.data)),
        api.get('/payouts/my-earnings').then(r => setEarningsData(r.data)),
    ]);

    useEffect(() => {
        fetchAll().finally(() => setLoading(false));
    }, []);

    const handleGenerate = async (productId) => {
        setGenerating(productId);
        try {
            const res = await api.post('/affiliates/generate', { productId });
            const [linksRes, statsRes] = await Promise.all([
                api.get('/affiliates/my-links'),
                api.get('/affiliates/stats'),
            ]);
            setMyLinks(linksRes.data);
            setStats(statsRes.data);
            setTab('links');
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(null);
        }
    };

    const getAffiliateUrl = (code) => `${window.location.origin}/go/${code}`;
    const linkedProductIds = new Set(myLinks.map(l => l.productId));

    const shareOnWhatsApp = (link) => {
        const url = getAffiliateUrl(link.code);
        const earn = (link.product?.price || 0) * (link.product?.commissionPct || 0) / 100;
        const msg = `🛍️ *${link.product?.title}*\n\n💰 Prix: ${formatCurrency(link.product?.price)}\n✅ Gagnez ${formatCurrency(earn)} par vente\n\nCommandez ici:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="My Links" value={stats.totalLinks} icon={Link2} color="bg-gradient-to-br from-primary-600 to-primary-500" />
                <StatCard label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} color="bg-gradient-to-br from-blue-600 to-blue-500" />
                <StatCard label="Total Earned" value={formatCurrency(stats.totalEarnings)} icon={DollarSign} color="bg-gradient-to-br from-emerald-600 to-emerald-500" />
                <StatCard label="Pending" value={formatCurrency(stats.pendingEarnings)} icon={TrendingUp} color="bg-gradient-to-br from-amber-600 to-amber-500" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                {[['explore', 'Explore Products', ShoppingBag], ['links', 'My Links', Link2], ['orders', 'My Sales', DollarSign], ['wallet', 'Wallet', Wallet]].map(([id, label, Icon]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Explore products */}
            {tab === 'explore' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map(product => {
                        const hasLink = linkedProductIds.has(product.id);
                        return (
                            <div key={product.id} className="card hover:border-gray-700 transition-colors">
                                {product.imageUrl && (
                                    <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gray-800">
                                        <img src={product.imageUrl} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-100 leading-snug">{product.title}</h3>
                                    <span className="badge-vendor ml-2 shrink-0">{product.commissionPct}%</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-emerald-400 font-bold text-lg">{formatCurrency(product.price)}</span>
                                    <span className="text-xs text-gray-600">by {product.merchant?.name}</span>
                                </div>
                                <div className="text-xs text-gray-600 mb-3">
                                    Earn <span className="text-emerald-400 font-semibold">{formatCurrency(product.price * product.commissionPct / 100)}</span> per sale
                                </div>
                                <button
                                    onClick={() => handleGenerate(product.id)}
                                    disabled={hasLink || generating === product.id}
                                    className={`w-full py-2 px-4 rounded-xl text-sm font-semibold transition-all ${hasLink
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                        : 'btn-primary'
                                        }`}
                                >
                                    {generating === product.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </div>
                                    ) : hasLink ? (
                                        <span className="flex items-center justify-center gap-1.5"><CheckCheck size={15} /> Link Generated</span>
                                    ) : 'Get Affiliate Link'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* My Links */}
            {tab === 'links' && (
                <div className="space-y-3">
                    {myLinks.length === 0 ? (
                        <div className="card text-center py-16 text-gray-500">
                            <Link2 size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No affiliate links yet</p>
                            <p className="text-sm">Browse products and generate your first link</p>
                        </div>
                    ) : (
                        myLinks.map(link => (
                            <div key={link.id} className="card flex flex-col sm:flex-row gap-4">
                                {link.product?.imageUrl && (
                                    <div className="w-full sm:w-20 h-20 rounded-xl bg-gray-800 overflow-hidden shrink-0">
                                        <img src={link.product.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-100 truncate">{link.product?.title}</h3>
                                        <span className="badge-vendor shrink-0">{link.product?.commissionPct}%</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-2 mb-2">
                                        <code className="text-xs text-primary-400 flex-1 truncate">{getAffiliateUrl(link.code)}</code>
                                        <CopyButton text={getAffiliateUrl(link.code)} />
                                    </div>
                                    <button
                                        onClick={() => shareOnWhatsApp(link)}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition-all mb-3"
                                    >
                                        <Share2 size={13} /> Partager sur WhatsApp
                                    </button>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <MousePointerClick size={13} /> {link._count?.clicks || 0} clicks
                                        </span>
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            <DollarSign size={13} /> {formatCurrency(link.totalEarnings)} earned
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* My Orders */}
            {tab === 'orders' && (
                <div className="space-y-3">
                    {orders.length === 0 ? (
                        <div className="card text-center py-16 text-gray-500">
                            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No sales generated yet</p>
                            <p className="text-sm">Share your links to start earning commissions!</p>
                        </div>
                    ) : (
                        <div className="card overflow-x-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/50 text-sm text-gray-400">
                                        <th className="p-4 font-medium">Order ID</th>
                                        <th className="p-4 font-medium">Product</th>
                                        <th className="p-4 font-medium text-right">Order Total</th>
                                        <th className="p-4 font-medium text-right">Your Commission</th>
                                        <th className="p-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-sm">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-200">#{order.id.split('-')[0]}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {order.product.imageUrl && (
                                                        <div className="w-8 h-8 rounded shrink-0 bg-gray-800 overflow-hidden">
                                                            <img src={order.product.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="text-gray-300 font-medium">{order.product.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right text-gray-400">{formatCurrency(order.amount)}</td>
                                            <td className="p-4 text-right font-bold text-emerald-400">+{formatCurrency(order.vendorCommission)}</td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                    {order.status || 'PENDING'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Wallet */}
            {tab === 'wallet' && (
                <div className="space-y-6">
                    {/* Balance cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="card text-center">
                            <p className="text-xs text-gray-500 mb-1">Available</p>
                            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(earningsData.summary.availableForPayout)}</p>
                        </div>
                        <div className="card text-center">
                            <p className="text-xs text-gray-500 mb-1">Pending approval</p>
                            <p className="text-2xl font-bold text-amber-400">{formatCurrency(earningsData.summary.pending)}</p>
                        </div>
                        <div className="card text-center">
                            <p className="text-xs text-gray-500 mb-1">Total paid out</p>
                            <p className="text-2xl font-bold text-gray-300">{formatCurrency(earningsData.summary.paid)}</p>
                        </div>
                        <div className="card flex items-center justify-center">
                            <button
                                onClick={() => setShowPayoutModal(true)}
                                disabled={(earningsData.summary.availableForPayout || 0) <= 0}
                                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wallet size={16} /> Request Payout
                            </button>
                        </div>
                    </div>

                    {/* Payout requests history */}
                    {earningsData.payoutRequests.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Payout Requests</h3>
                            <div className="card p-0 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-gray-500 text-left">
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Amount</th>
                                            <th className="px-4 py-3 font-medium">Method</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {earningsData.payoutRequests.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-800/30">
                                                <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                                                <td className="px-4 py-3 text-gray-300">{p.method}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                                                        p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        p.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        p.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>{p.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{p.note || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Earnings breakdown */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Earnings History</h3>
                        {earningsData.earnings.length === 0 ? (
                            <div className="card text-center py-12 text-gray-500">
                                <Wallet size={40} className="mx-auto mb-3 opacity-20" />
                                <p>No earnings yet. Start sharing your affiliate links!</p>
                            </div>
                        ) : (
                            <div className="card p-0 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-gray-500 text-left">
                                            <th className="px-4 py-3 font-medium">Product</th>
                                            <th className="px-4 py-3 font-medium">Customer</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium text-right">Commission</th>
                                            <th className="px-4 py-3 font-medium text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {earningsData.earnings.map(e => (
                                            <tr key={e.id} className="hover:bg-gray-800/30">
                                                <td className="px-4 py-3 text-gray-300">{e.affiliateLink?.product?.title}</td>
                                                <td className="px-4 py-3 text-gray-400">{e.order?.customerName}</td>
                                                <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-400">+{formatCurrency(e.amount)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                                                        e.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        e.status === 'PAID' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        e.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>{e.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showPayoutModal && (
                <PayoutModal
                    available={earningsData.summary.availableForPayout || 0}
                    onClose={() => setShowPayoutModal(false)}
                    onSuccess={() => {
                        setShowPayoutModal(false);
                        fetchAll();
                        setTab('wallet');
                    }}
                />
            )}
        </div>
    );
}
