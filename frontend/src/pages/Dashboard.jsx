import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MerchantDashboard from './dashboards/MerchantDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { Store, Link2, Shield } from 'lucide-react';

const DASHBOARD_MAP = {
    MERCHANT: { component: MerchantDashboard, label: 'Merchant Dashboard', icon: Store, gradient: 'from-blue-500 to-primary-600' },
    VENDOR: { component: VendorDashboard, label: 'Vendor Dashboard', icon: Link2, gradient: 'from-purple-500 to-primary-600' },
    ADMIN: { component: AdminDashboard, label: 'Admin Panel', icon: Shield, gradient: 'from-amber-500 to-primary-600' },
};

export default function Dashboard() {
    const { user } = useAuth();
    if (!user) return null;

    const config = DASHBOARD_MAP[user.role];
    const DashboardComponent = config.component;
    const Icon = config.icon;

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}>
                        <Icon size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{config.label}</h1>
                        <p className="text-gray-500 text-sm">Welcome back, <span className="text-gray-300">{user.name}</span></p>
                    </div>
                </div>

                <DashboardComponent />
            </main>
        </div>
    );
}
