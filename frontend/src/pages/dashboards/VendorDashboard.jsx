import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link2, MousePointerClick, DollarSign, TrendingUp, Copy, CheckCheck, ShoppingBag, ExternalLink } from 'lucide-react';

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
        <button onClick={handle} title="Copy link" className="p-1.5 text-gray-500 hover:text-primary-400 transition-colors">
            {copied ? <CheckCheck size={15} className="text-emerald-400" /> : <Copy size={15} />}
        </button>
    );
}

export default function VendorDashboard() {
    const [products, setProducts] = useState([]);
    const [myLinks, setMyLinks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(null);
    const [tab, setTab] = useState('explore');

    useEffect(() => {
        Promise.all([
            api.get('/products').then(r => setProducts(r.data)),
            api.get('/affiliates/my-links').then(r => setMyLinks(r.data)),
            api.get('/affiliates/stats').then(r => setStats(r.data)),
            api.get('/orders/vendor').then(r => setOrders(r.data)),
        ]).finally(() => setLoading(false));
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
                <StatCard label="Total Earned" value={`$${(stats.totalEarnings || 0).toFixed(2)}`} icon={DollarSign} color="bg-gradient-to-br from-emerald-600 to-emerald-500" />
                <StatCard label="Pending" value={`$${(stats.pendingEarnings || 0).toFixed(2)}`} icon={TrendingUp} color="bg-gradient-to-br from-amber-600 to-amber-500" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                {[['explore', 'Explore Products', ShoppingBag], ['links', 'My Links', Link2], ['orders', 'My Sales', DollarSign]].map(([id, label, Icon]) => (
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
                                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-100 leading-snug">{product.title}</h3>
                                    <span className="badge-vendor ml-2 shrink-0">{product.commissionPct}%</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-emerald-400 font-bold text-lg">${product.price.toFixed(2)}</span>
                                    <span className="text-xs text-gray-600">by {product.merchant?.name}</span>
                                </div>
                                <div className="text-xs text-gray-600 mb-3">
                                    Earn <span className="text-emerald-400 font-semibold">${(product.price * product.commissionPct / 100).toFixed(2)}</span> per sale
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
                                    ) : hasLink ? '✓ Link Generated' : 'Get Affiliate Link'}
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
                                        <img src={link.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-100 truncate">{link.product?.title}</h3>
                                        <span className="badge-vendor shrink-0">{link.product?.commissionPct}%</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-2 mb-3">
                                        <code className="text-xs text-primary-400 flex-1 truncate">{getAffiliateUrl(link.code)}</code>
                                        <CopyButton text={getAffiliateUrl(link.code)} />
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <MousePointerClick size={13} /> {link._count?.clicks || 0} clicks
                                        </span>
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            <DollarSign size={13} /> ${(link.totalEarnings || 0).toFixed(2)} earned
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
                                                            <img src={order.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="text-gray-300 font-medium">{order.product.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right text-gray-400">${order.amount.toFixed(2)}</td>
                                            <td className="p-4 text-right font-bold text-emerald-400">+${order.vendorCommission.toFixed(2)}</td>
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
        </div>
    );
}
