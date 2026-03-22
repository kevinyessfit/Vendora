import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Shield, Zap, ArrowRight, Check, Link2, Store, ChevronRight } from 'lucide-react';

const FEATURES = [
    { icon: Store, title: 'List Your Products', desc: 'Merchants post products with custom commission rates. Get discovered by thousands of active vendors.', color: 'from-blue-500 to-cyan-500' },
    { icon: Link2, title: 'Generate Affiliate Links', desc: 'Vendors get a unique tracking link per product in one click. Share anywhere and start earning.', color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, title: 'Track Performance', desc: "Real-time analytics on clicks, conversions, and earnings. Know exactly what's working.", color: 'from-emerald-500 to-teal-500' },
    { icon: Shield, title: 'Trusted & Transparent', desc: 'Transparent commission structure. No hidden fees, no surprises. Free forever.', color: 'from-amber-500 to-orange-500' },
];

const HOW_IT_WORKS = [
    { step: '01', title: 'Create your account', desc: 'Sign up free as a Merchant or Vendor in under 60 seconds.', role: 'Both' },
    { step: '02', title: 'Merchants list products', desc: 'Set your price and commission percentage — vendors earn that % on every sale they drive.', role: 'Merchant' },
    { step: '03', title: 'Vendors grab links', desc: 'Browse the marketplace, pick products you love, and generate your unique affiliate link instantly.', role: 'Vendor' },
    { step: '04', title: 'Share & earn', desc: 'Promote via social, email, or blog. Commissions are tracked automatically.', role: 'Vendor' },
];

const STATS = [
    { value: '10K+', label: 'Active Vendors' },
    { value: '2.5K+', label: 'Products Listed' },
    { value: '$1.2M+', label: 'Commissions Paid' },
    { value: '100%', label: 'Free Forever' },
];

function PublicNavbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/40 transition-shadow">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            Vendora
                        </span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-6">
                        <Link to="/marketplace" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Marketplace</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Log in</Link>
                        <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function Landing() {
    return (
        <div className="min-h-screen">
            <PublicNavbar />

            {/* Hero */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary-600/20 via-accent-500/10 to-transparent rounded-full blur-[120px]" />
                    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                        <Zap size={14} className="text-primary-400" />
                        The free affiliate marketplace
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                        Sell more.
                        <br />
                        <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                            Share the upside.
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Vendora connects merchants with affiliate vendors who promote their products and earn commissions.
                        No fees. No subscriptions. Just growth.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
                            Start for Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/marketplace" className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
                            Browse Marketplace <ChevronRight size={18} />
                        </Link>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">Free forever. No credit card required.</p>
                </div>

                {/* Hero card mockup */}
                <div className="max-w-5xl mx-auto mt-16 relative">
                    <div className="absolute -inset-4 bg-gradient-to-b from-primary-500/10 to-transparent rounded-3xl blur-xl pointer-events-none" />
                    <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                        {[
                            { title: 'Wireless Headphones', price: '$149.99', commission: '15%', earn: '$22.49', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', affiliates: 42 },
                            { title: 'Smart Fitness Tracker', price: '$79.99', commission: '12%', earn: '$9.60', img: 'https://images.unsplash.com/photo-1575311373937-040b8e97fd29?w=400&q=80', affiliates: 31 },
                            { title: 'Portable Charger Pro', price: '$59.99', commission: '18%', earn: '$10.80', img: 'https://images.unsplash.com/photo-1609592806596-b68d78e2d7ef?w=400&q=80', affiliates: 18 },
                        ].map((p, i) => (
                            <div key={i} className={`card hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 ${i === 1 ? 'sm:scale-105 border-primary-500/30' : ''}`}>
                                <div className="h-36 rounded-xl bg-gray-800 overflow-hidden mb-4">
                                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-semibold text-gray-100 mb-1">{p.title}</h3>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-emerald-400 font-bold">{p.price}</span>
                                    <span className="badge-vendor">{p.commission} comm.</span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center justify-between">
                                    <span>Earn <span className="text-emerald-400 font-semibold">{p.earn}</span>/sale</span>
                                    <span>{p.affiliates} affiliates</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 border-y border-gray-800 bg-gray-900/50">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything you need to grow</h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">A complete platform for merchants and vendors to collaborate, track, and scale.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="card group hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 flex gap-5">
                                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-100 text-lg mb-2">{title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-4 bg-gray-900/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">How Vendora works</h2>
                        <p className="text-gray-400 text-lg">Simple for merchants. Lucrative for vendors.</p>
                    </div>
                    <div className="space-y-6">
                        {HOW_IT_WORKS.map(({ step, title, desc, role }) => (
                            <div key={step} className="card flex gap-6 items-start group hover:border-gray-700 transition-all">
                                <div className="text-4xl font-black text-gray-800 group-hover:text-primary-800 transition-colors leading-none">{step}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-100 text-lg">{title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${role === 'Merchant' ? 'badge-merchant' : role === 'Vendor' ? 'badge-vendor' : 'bg-gray-700 text-gray-400'}`}>{role}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-accent-900/20 to-gray-950" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                        Ready to start growing?
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Join thousands of merchants and vendors already using Vendora. It's free — forever.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3.5">
                            Create Free Account <ArrowRight size={18} />
                        </Link>
                        <Link to="/marketplace" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3.5">
                            Explore Marketplace
                        </Link>
                    </div>
                    <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        {['No credit card needed', 'Free forever', 'Cancel anytime'].map(t => (
                            <li key={t} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> {t}</li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-md flex items-center justify-center">
                            <ShoppingBag size={12} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-300">Vendora</span>
                    </div>
                    <p className="text-sm text-gray-600">© 2026 Vendora. All rights reserved.</p>
                    <div className="flex gap-5 text-sm text-gray-500">
                        <Link to="/marketplace" className="hover:text-gray-300 transition-colors">Marketplace</Link>
                        <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
                        <Link to="/register" className="hover:text-gray-300 transition-colors">Sign Up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
