import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingBag, Search, Filter, DollarSign, TrendingUp, ArrowRight, Package, X } from 'lucide-react';

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

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'commission', label: 'Highest Commission' },
];

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [minComm, setMinComm] = useState(0);

    useEffect(() => {
        api.get('/products')
            .then(r => { setProducts(r.data); setFiltered(r.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...products];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            );
        }
        if (minComm > 0) {
            result = result.filter(p => p.commissionPct >= minComm);
        }
        if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
        else if (sort === 'commission') result.sort((a, b) => b.commissionPct - a.commissionPct);
        else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFiltered(result);
    }, [search, sort, minComm, products]);

    return (
        <div className="min-h-screen">
            <PublicNavbar />

            {/* Page header */}
            <section className="relative pt-28 pb-12 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary-600/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Affiliate Marketplace</h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            Discover products to promote and start earning commissions — instantly.
                        </p>
                    </div>

                    {/* Search + Filter bar */}
                    <div className="card flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                className="input pl-10"
                                placeholder="Search products..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2">
                                <Filter size={15} className="text-gray-500 shrink-0" />
                                <select
                                    className="input py-2.5 text-sm pr-8"
                                    value={minComm}
                                    onChange={e => setMinComm(Number(e.target.value))}
                                >
                                    <option value={0}>All commissions</option>
                                    <option value={10}>≥ 10%</option>
                                    <option value={15}>≥ 15%</option>
                                    <option value={20}>≥ 20%</option>
                                </select>
                            </div>
                            <select
                                className="input py-2.5 text-sm pr-8"
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products grid */}
            <section className="pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24 text-gray-500">
                            <Package size={56} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-medium text-gray-400">No products found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-5">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filtered.map(product => (
                                    <Link
                                        key={product.id}
                                        to={`/products/${product.id}`}
                                        className="card group hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                    >
                                        {product.imageUrl ? (
                                            <div className="h-44 rounded-xl overflow-hidden bg-gray-800 mb-4 shrink-0">
                                                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ) : (
                                            <div className="h-44 rounded-xl bg-gray-800 mb-4 flex items-center justify-center shrink-0">
                                                <Package size={36} className="text-gray-700" />
                                            </div>
                                        )}

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-start gap-2 mb-2">
                                                <h2 className="font-semibold text-gray-100 leading-snug flex-1 group-hover:text-primary-300 transition-colors">{product.title}</h2>
                                                <span className="badge-vendor shrink-0">{product.commissionPct}%</span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>

                                            <div className="mt-auto space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-emerald-400 font-bold text-xl">${product.price.toFixed(2)}</span>
                                                    <span className="text-xs text-gray-600">by {product.merchant?.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <TrendingUp size={12} />
                                                        {product._count?.affiliateLinks || 0} affiliates
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                                        <DollarSign size={12} />
                                                        Earn ${(product.price * product.commissionPct / 100).toFixed(2)}/sale
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-primary-400 text-xs font-medium group-hover:gap-2 transition-all">
                                                    View & get link <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-16 px-4 border-t border-gray-800 bg-gray-900/40">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">Want to list your product?</h2>
                    <p className="text-gray-400 mb-6">Create a merchant account and your products will appear in this marketplace.</p>
                    <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                        Become a Merchant <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
