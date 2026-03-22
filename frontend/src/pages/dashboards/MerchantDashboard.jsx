import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PlusCircle, Package, TrendingUp, Users, Edit2, Trash2, X, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

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

function ProductModal({ product, onClose, onSaved }) {
    const isEdit = !!product?.id;
    const [form, setForm] = useState({
        title: product?.title || '',
        description: product?.description || '',
        imageUrl: product?.imageUrl || '',
        price: product?.price || '',
        commissionPct: product?.commissionPct || 10,
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('commissionPct', form.commissionPct);
            if (form.imageUrl && !imageFile) formData.append('imageUrl', form.imageUrl);
            if (imageFile) formData.append('image', imageFile);

            if (isEdit) {
                await api.put(`/products/${product.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="card w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Product' : 'List New Product'}</h2>
                {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Product title</label>
                        <input className="input" placeholder="e.g. Wireless Headphones" value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea className="input resize-none h-24" placeholder="Describe your product..."
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="label">Product Image (optional)</label>
                        <div className="flex gap-3 items-center">
                            <input type="file" accept="image/*" className="input file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
                                onChange={e => {
                                    setImageFile(e.target.files[0]);
                                    setForm(p => ({ ...p, imageUrl: '' }));
                                }}
                            />
                            <div className="text-xs text-gray-500 uppercase font-semibold">OR</div>
                            <input className="input flex-1" placeholder="Paste image URL..." value={form.imageUrl}
                                onChange={e => {
                                    setForm(p => ({ ...p, imageUrl: e.target.value }));
                                    setImageFile(null);
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Price ($)</label>
                            <input type="number" min="0" step="0.01" className="input" placeholder="99.99" value={form.price}
                                onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="label">Commission (%)</label>
                            <input type="number" min="1" max="100" className="input" value={form.commissionPct}
                                onChange={e => setForm(p => ({ ...p, commissionPct: e.target.value }))} required />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Save Changes' : 'List Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MerchantDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalProduct, setModalProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState('products');

    const fetchData = async () => {
        try {
            const [prodRes, ordRes] = await Promise.all([
                api.get('/products/mine'),
                api.get('/orders/merchant')
            ]);
            setProducts(prodRes.data);
            setOrders(ordRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        await api.delete(`/products/${id}`);
        setProducts(p => p.filter(x => x.id !== id));
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x));
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const openNew = () => { setModalProduct(null); setShowModal(true); };
    const openEdit = (p) => { setModalProduct(p); setShowModal(true); };
    const onSaved = () => { setShowModal(false); fetchData(); };

    const totalAffiliates = products.reduce((s, p) => s + (p._count?.affiliateLinks || 0), 0);
    const totalEarnings = orders.reduce((s, o) => s + o.merchantEarnings, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Products" value={products.length} icon={Package} color="bg-gradient-to-br from-primary-600 to-primary-500" />
                <StatCard label="Total Sales" value={orders.length} icon={ShoppingCart} color="bg-gradient-to-br from-blue-600 to-blue-500" />
                <StatCard label="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} icon={DollarSign} color="bg-gradient-to-br from-emerald-600 to-emerald-500" />
                <StatCard label="Active Affiliates" value={totalAffiliates} icon={Users} color="bg-gradient-to-br from-purple-600 to-purple-500" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                    <button onClick={() => setTab('products')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'products' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
                        <Package size={15} /> My Products
                    </button>
                    <button onClick={() => setTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'orders' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
                        <ShoppingCart size={15} /> Recent Orders
                    </button>
                </div>
                {tab === 'products' && (
                    <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
                        <PlusCircle size={16} /> List Product
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : tab === 'products' ? (
                products.length === 0 ? (
                    <div className="card text-center py-16 text-gray-500">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-lg">No products yet</p>
                        <p className="text-sm">Click &ldquo;List Product&rdquo; to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => (
                            <div key={product.id} className="card group hover:border-gray-700 transition-colors">
                                {product.imageUrl && (
                                    <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gray-800">
                                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-100 leading-snug">{product.title}</h3>
                                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                                        <DollarSign size={16} />{product.price.toFixed(2)}
                                    </span>
                                    <span className="text-gray-400">{product.commissionPct}% commission</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{product._count?.affiliateLinks || 0} affiliates</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                orders.length === 0 ? (
                    <div className="card text-center py-16 text-gray-500">
                        <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-lg">No orders yet</p>
                        <p className="text-sm">When customers buy your products, they will appear here.</p>
                    </div>
                ) : (
                    <div className="card overflow-x-auto p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/50 text-sm text-gray-400">
                                    <th className="p-4 font-medium">Order details</th>
                                    <th className="p-4 font-medium">Product</th>
                                    <th className="p-4 font-medium">Affiliate</th>
                                    <th className="p-4 font-medium text-right">Order Total</th>
                                    <th className="p-4 font-medium text-right">Vendor Cut</th>
                                    <th className="p-4 font-medium text-right">Platform Cut</th>
                                    <th className="p-4 font-medium text-right">Your Net Earnings</th>
                                    <th className="p-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-200">{order.customerName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]" title={order.id}>#{order.id.split('-')[0]}</p>
                                        </td>
                                        <td className="p-4 text-gray-300">{order.product.title}</td>
                                        <td className="p-4">
                                            {order.affiliateLink ? (
                                                <span className="badge-vendor truncate max-w-[120px] font-mono inline-block">Ref: {order.affiliateLink.vendor.name}</span>
                                            ) : <span className="text-gray-600 text-xs italic">Direct (No affiliate)</span>}
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-300">${order.amount.toFixed(2)}</td>
                                        <td className="p-4 text-right text-gray-400">-${order.vendorCommission.toFixed(2)}</td>
                                        <td className="p-4 text-right text-gray-400">-${order.platformCommission.toFixed(2)}</td>
                                        <td className="p-4 text-right font-bold text-emerald-400">${order.merchantEarnings.toFixed(2)}</td>
                                        <td className="p-4 text-right">
                                            <select
                                                className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none"
                                                value={order.status || 'PENDING'}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {showModal && <ProductModal product={modalProduct} onClose={() => setShowModal(false)} onSaved={onSaved} />}
        </div>
    );
}
