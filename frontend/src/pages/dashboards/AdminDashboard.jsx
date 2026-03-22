import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Package, Link2, MousePointerClick, Trash2, ToggleLeft, ToggleRight, Shield, ShoppingCart } from 'lucide-react';

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

export default function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/products'),
                api.get('/orders/all'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        await api.delete(`/admin/users/${id}`);
        setUsers(u => u.filter(x => x.id !== id));
    };

    const handleToggleProduct = async (id) => {
        const res = await api.patch(`/admin/products/${id}/toggle`);
        setProducts(p => p.map(x => x.id === id ? { ...x, isActive: res.data.isActive } : x));
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x));
        } catch (e) {
            alert('Failed to update order status');
        }
    };

    const ROLE_BADGE = { MERCHANT: 'badge-merchant', VENDOR: 'badge-vendor', ADMIN: 'badge-admin' };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 w-fit">
                {[['overview', 'Overview', Shield], ['users', 'Users', Users], ['products', 'Products', Package], ['orders', 'Orders', ShoppingCart]].map(([id, label, Icon]) => (
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

            {tab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-gradient-to-br from-primary-600 to-primary-500" />
                    <StatCard label="Merchants" value={stats.merchants} icon={Package} color="bg-gradient-to-br from-blue-600 to-blue-500" />
                    <StatCard label="Vendors" value={stats.vendors} icon={Link2} color="bg-gradient-to-br from-purple-600 to-purple-500" />
                    <StatCard label="Products" value={stats.totalProducts} icon={Package} color="bg-gradient-to-br from-emerald-600 to-emerald-500" />
                    <StatCard label="Clicks" value={stats.totalClicks} icon={MousePointerClick} color="bg-gradient-to-br from-amber-600 to-amber-500" />
                </div>
            )}

            {tab === 'users' && (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-left">
                                    <th className="px-5 py-4 font-medium">Name</th>
                                    <th className="px-5 py-4 font-medium">Email</th>
                                    <th className="px-5 py-4 font-medium">Role</th>
                                    <th className="px-5 py-4 font-medium">Products</th>
                                    <th className="px-5 py-4 font-medium">Links</th>
                                    <th className="px-5 py-4 font-medium">Joined</th>
                                    <th className="px-5 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-200">{user.name}</td>
                                        <td className="px-5 py-3 text-gray-400">{user.email}</td>
                                        <td className="px-5 py-3">
                                            <span className={ROLE_BADGE[user.role]}>{user.role}</span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400">{user._count?.products || 0}</td>
                                        <td className="px-5 py-3 text-gray-400">{user._count?.affiliateLinks || 0}</td>
                                        <td className="px-5 py-3 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            {user.role !== 'ADMIN' && (
                                                <button onClick={() => handleDeleteUser(user.id)} className="btn-danger text-xs py-1 px-2">
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'products' && (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-left">
                                    <th className="px-5 py-4 font-medium">Product</th>
                                    <th className="px-5 py-4 font-medium">Merchant</th>
                                    <th className="px-5 py-4 font-medium">Price</th>
                                    <th className="px-5 py-4 font-medium">Commission</th>
                                    <th className="px-5 py-4 font-medium">Affiliates</th>
                                    <th className="px-5 py-4 font-medium">Status</th>
                                    <th className="px-5 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-200 max-w-xs truncate">{p.title}</td>
                                        <td className="px-5 py-3 text-gray-400">{p.merchant?.name}</td>
                                        <td className="px-5 py-3 text-emerald-400 font-semibold">${p.price.toFixed(2)}</td>
                                        <td className="px-5 py-3 text-gray-400">{p.commissionPct}%</td>
                                        <td className="px-5 py-3 text-gray-400">{p._count?.affiliateLinks || 0}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                                                {p.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <button onClick={() => handleToggleProduct(p.id)} className="text-gray-500 hover:text-primary-400 transition-colors">
                                                {p.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'orders' && (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-gray-500 text-left">
                                    <th className="px-5 py-4 font-medium">Order details</th>
                                    <th className="px-5 py-4 font-medium">Product</th>
                                    <th className="px-5 py-4 font-medium">Merchant</th>
                                    <th className="px-5 py-4 font-medium">Vendor</th>
                                    <th className="px-5 py-4 font-medium text-right">Order Total</th>
                                    <th className="px-5 py-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-gray-200">{order.customerName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]" title={order.id}>#{order.id.split('-')[0]}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-300">{order.product.title}</td>
                                        <td className="px-5 py-3 text-gray-400">{order.product.merchant.name}</td>
                                        <td className="px-5 py-3">
                                            {order.affiliateLink ? (
                                                <span className="badge-vendor">Ref: {order.affiliateLink.vendor.name}</span>
                                            ) : <span className="text-gray-600 text-xs italic">Direct (No affiliate)</span>}
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium text-gray-300">${order.amount.toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right">
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
                </div>
            )}
        </div>
    );
}
