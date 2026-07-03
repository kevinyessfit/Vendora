import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LayoutDashboard, LogOut, Shield, Link2, Store, Settings } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleIcon = {
        MERCHANT: <Store size={14} />,
        VENDOR: <Link2 size={14} />,
        ADMIN: <Shield size={14} />,
    };

    const roleBadgeClass = {
        MERCHANT: 'badge-merchant',
        VENDOR: 'badge-vendor',
        ADMIN: 'badge-admin',
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/40 transition-shadow">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            Vendora
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="flex items-center gap-5">
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-primary-400' : 'text-gray-400 hover:text-gray-100'}`}
                        >
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <Link
                            to="/settings"
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'text-primary-400' : 'text-gray-400 hover:text-gray-100'}`}
                        >
                            <Settings size={16} />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                    </div>

                    {/* User info */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-200">{user.name}</span>
                                <span className={`flex items-center gap-1 ${roleBadgeClass[user.role]}`}>
                                    {roleIcon[user.role]}
                                    {user.role}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                aria-label="Log out"
                                className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
