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

export default function Terms() {
    return (
        <div className="min-h-screen">
            <PublicNavbar />
            <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-white mb-3">Terms of Service</h1>
                    <p className="text-gray-500 text-sm">Last updated: May 10, 2026</p>
                </div>

                <div className="card space-y-0">
                    <Section title="1. Acceptance of Terms">
                        <p>By accessing or using Vendora ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.</p>
                    </Section>

                    <Section title="2. Description of Service">
                        <p>Vendora is a free affiliate marketplace that connects merchants (who list products) with vendors (who promote those products via unique affiliate links) and earn commissions on resulting sales.</p>
                        <p>The Platform does not sell products directly and is not a party to any transaction between merchants and customers.</p>
                    </Section>

                    <Section title="3. User Accounts">
                        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials.</p>
                        <p>Vendora reserves the right to suspend or terminate accounts that violate these Terms.</p>
                    </Section>

                    <Section title="4. Merchant Obligations">
                        <p>Merchants agree to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>List only products they have the right to sell</li>
                            <li>Accurately describe products and set fair prices</li>
                            <li>Fulfill orders placed through the Platform</li>
                            <li>Contact customers within 48 hours of order placement</li>
                            <li>Honor the commission percentage set at product listing</li>
                        </ul>
                    </Section>

                    <Section title="5. Vendor / Affiliate Obligations">
                        <p>Vendors agree to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Promote products honestly and accurately</li>
                            <li>Not engage in spam, misleading advertising, or fraudulent activity</li>
                            <li>Not use bots or artificial means to generate clicks or orders</li>
                        </ul>
                    </Section>

                    <Section title="6. Commissions & Payouts">
                        <p>Commission rates are set by merchants and visible on each product page. Commissions are credited as <strong className="text-gray-300">PENDING</strong> upon order creation and <strong className="text-gray-300">APPROVED</strong> when the merchant marks the order as COMPLETED.</p>
                        <p>Vendora retains a platform fee of 5% on each transaction. Payout requests are processed manually by the Vendora admin team within 7 business days.</p>
                    </Section>

                    <Section title="7. Prohibited Activities">
                        <p>Users must not:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>List counterfeit, illegal, or dangerous products</li>
                            <li>Attempt to circumvent the affiliate tracking system</li>
                            <li>Harass other users or platform staff</li>
                            <li>Use the platform for money laundering or fraudulent transactions</li>
                        </ul>
                    </Section>

                    <Section title="8. Limitation of Liability">
                        <p>Vendora is a marketplace platform and is not liable for: product quality, delivery failures, payment disputes between merchants and customers, or any indirect damages arising from use of the Platform.</p>
                        <p>Vendora's total liability to any user shall not exceed the fees paid by that user to Vendora in the 12 months preceding the claim.</p>
                    </Section>

                    <Section title="9. Modifications">
                        <p>Vendora reserves the right to modify these Terms at any time. Users will be notified of significant changes. Continued use of the Platform after changes constitutes acceptance of the new Terms.</p>
                    </Section>

                    <Section title="10. Contact">
                        <p>For questions about these Terms, contact us at: <a href="mailto:dessoyessoufou85@gmail.com" className="text-primary-400 hover:underline">dessoyessoufou85@gmail.com</a></p>
                    </Section>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>
                    {' · '}
                    <Link to="/" className="hover:text-gray-400 transition-colors">Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
