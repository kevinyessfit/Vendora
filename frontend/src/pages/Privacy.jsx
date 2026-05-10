import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

function PublicNavbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
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

function Section({ title, children }) {
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
            <div className="text-gray-400 leading-relaxed space-y-3">{children}</div>
        </div>
    );
}

export default function Privacy() {
    return (
        <div className="min-h-screen">
            <PublicNavbar />
            <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
                    <p className="text-gray-500 text-sm">Last updated: May 10, 2026</p>
                </div>

                <div className="card space-y-0">
                    <Section title="1. Data Controller">
                        <p>Vendora ("we", "us", "our") is the data controller for personal information collected through this Platform. Contact: <a href="mailto:dessoyessoufou85@gmail.com" className="text-primary-400 hover:underline">dessoyessoufou85@gmail.com</a></p>
                    </Section>

                    <Section title="2. Information We Collect">
                        <p><strong className="text-gray-300">Account data:</strong> Name, email address, and password (hashed) when you register.</p>
                        <p><strong className="text-gray-300">Order data:</strong> Customer name, phone number, delivery address, and optional email when an order is placed.</p>
                        <p><strong className="text-gray-300">Usage data:</strong> IP addresses recorded for affiliate click tracking. No browsing history or cookies are stored.</p>
                        <p><strong className="text-gray-300">Product data:</strong> Product information and images uploaded by merchants.</p>
                    </Section>

                    <Section title="3. How We Use Your Information">
                        <ul className="list-disc list-inside space-y-1">
                            <li>To provide and operate the Platform</li>
                            <li>To process orders and calculate commissions</li>
                            <li>To send transactional emails (order confirmations, commission notifications)</li>
                            <li>To detect and prevent fraudulent activity</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                        <p>We do not sell your personal data to third parties.</p>
                    </Section>

                    <Section title="4. Data Sharing">
                        <p>We share data only with:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong className="text-gray-300">Merchants:</strong> receive customer contact details for orders placed on their products</li>
                            <li><strong className="text-gray-300">Service providers:</strong> Supabase (database hosting), Vercel (application hosting), Resend (email delivery), Cloudinary (image storage)</li>
                        </ul>
                        <p>All service providers are bound by data processing agreements and GDPR-compliant practices.</p>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>We retain personal data for as long as your account is active or as needed to provide the service. You may request deletion of your account and associated data at any time by contacting us.</p>
                        <p>Order records are retained for 5 years for legal and accounting purposes.</p>
                    </Section>

                    <Section title="6. Your Rights">
                        <p>Depending on your jurisdiction, you have the right to:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong className="text-gray-300">Access</strong> the personal data we hold about you</li>
                            <li><strong className="text-gray-300">Rectify</strong> inaccurate data (via Settings page)</li>
                            <li><strong className="text-gray-300">Delete</strong> your account and data</li>
                            <li><strong className="text-gray-300">Portability</strong> — receive your data in a structured format</li>
                            <li><strong className="text-gray-300">Object</strong> to certain processing activities</li>
                        </ul>
                        <p>To exercise these rights, email us at <a href="mailto:dessoyessoufou85@gmail.com" className="text-primary-400 hover:underline">dessoyessoufou85@gmail.com</a>. We respond within 30 days.</p>
                    </Section>

                    <Section title="7. Cookies">
                        <p>Vendora does not use tracking cookies. We use only technically necessary browser storage (localStorage) to maintain your session after login. No third-party advertising cookies are used.</p>
                    </Section>

                    <Section title="8. Security">
                        <p>Passwords are hashed using bcrypt. All communications are encrypted via HTTPS/TLS. Database access is restricted and monitored.</p>
                    </Section>

                    <Section title="9. Contact & Complaints">
                        <p>For privacy-related requests or complaints: <a href="mailto:dessoyessoufou85@gmail.com" className="text-primary-400 hover:underline">dessoyessoufou85@gmail.com</a></p>
                        <p>If you believe your rights have been violated, you may also lodge a complaint with your local data protection authority.</p>
                    </Section>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <Link to="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>
                    {' · '}
                    <Link to="/" className="hover:text-gray-400 transition-colors">Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
