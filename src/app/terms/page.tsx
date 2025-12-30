import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
    title: "Terms & Conditions | Kabadiyo",
    description: "Terms of Service for Kabadiyo - India's #1 Scrap Selling App"
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold">Terms & Conditions</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-3xl prose prose-neutral dark:prose-invert">
                <p className="text-muted-foreground">Effective Date: December 31, 2024</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the Kabadiyo application ("App"), you agree to be bound by these
                    Terms and Conditions ("Terms"). If you do not agree, please do not use the App.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    Kabadiyo is a platform that connects users who want to sell scrap materials with verified
                    Kabadiwalas (scrap dealers). We also offer local services such as plumbing, electrical work,
                    and cleaning through our partner network.
                </p>

                <h2>3. User Accounts</h2>
                <ul>
                    <li>You must provide accurate information during registration.</li>
                    <li>You are responsible for maintaining the confidentiality of your account.</li>
                    <li>You must be at least 13 years old to use this service.</li>
                    <li>One account per person is allowed.</li>
                </ul>

                <h2>4. User Responsibilities</h2>
                <ul>
                    <li>Provide accurate descriptions and weights of scrap materials.</li>
                    <li>Be available at the scheduled pickup time.</li>
                    <li>Treat Kabadiwalas and service providers with respect.</li>
                    <li>Do not use the App for any illegal or fraudulent purposes.</li>
                </ul>

                <h2>5. Kabadiwala Responsibilities</h2>
                <ul>
                    <li>Arrive on time for scheduled pickups.</li>
                    <li>Use accurate weighing equipment.</li>
                    <li>Offer fair market rates for scrap materials.</li>
                    <li>Complete payments as agreed within the App.</li>
                </ul>

                <h2>6. Payments & Transactions</h2>
                <p>
                    All payments for scrap are made directly between the user and the Kabadiwala.
                    Kabadiyo is not responsible for:
                </p>
                <ul>
                    <li>Price negotiations between parties.</li>
                    <li>Disputes over weighing or quality of materials.</li>
                    <li>Cash handling or payment collection.</li>
                </ul>

                <h2>7. Points & Rewards Program</h2>
                <ul>
                    <li>Users earn points for various activities (referrals, pickups, daily logins).</li>
                    <li><strong>1,00,000 points</strong> can be redeemed for ₹2000 worth of local services.</li>
                    <li>Points have no cash value and cannot be transferred.</li>
                    <li>We reserve the right to modify or discontinue the rewards program.</li>
                </ul>

                <h2>8. Prohibited Activities</h2>
                <ul>
                    <li>Creating fake accounts or impersonating others.</li>
                    <li>Posting false or misleading content.</li>
                    <li>Harassing, abusing, or threatening other users.</li>
                    <li>Attempting to hack, disrupt, or overload our systems.</li>
                    <li>Selling illegal, hazardous, or prohibited materials.</li>
                </ul>

                <h2>9. Content Ownership</h2>
                <p>
                    You retain ownership of content you upload (photos, messages). By uploading, you grant
                    Kabadiyo a non-exclusive license to use, display, and distribute such content for
                    service purposes.
                </p>

                <h2>10. Disclaimer of Warranties</h2>
                <p>
                    The App is provided "AS IS" without warranties of any kind. We do not guarantee:
                </p>
                <ul>
                    <li>Availability of Kabadiwalas in your area.</li>
                    <li>Accuracy of scrap rates displayed.</li>
                    <li>Quality of service from third-party providers.</li>
                </ul>

                <h2>11. Limitation of Liability</h2>
                <p>
                    Kabadiyo shall not be liable for any indirect, incidental, or consequential damages
                    arising from your use of the App. Our total liability shall not exceed ₹5000.
                </p>

                <h2>12. Dispute Resolution</h2>
                <p>
                    Any disputes arising from these Terms shall be resolved through:
                </p>
                <ol>
                    <li>Direct negotiation between parties.</li>
                    <li>Mediation through our customer support.</li>
                    <li>Binding arbitration in New Delhi, India.</li>
                </ol>

                <h2>13. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your account for violation of these Terms.
                    You may delete your account at any time through the App settings.
                </p>

                <h2>14. Changes to Terms</h2>
                <p>
                    We may update these Terms periodically. Continued use of the App after changes
                    constitutes acceptance of the new Terms.
                </p>

                <h2>15. Governing Law</h2>
                <p>
                    These Terms are governed by the laws of India. Any legal proceedings shall be
                    conducted in the courts of New Delhi.
                </p>

                <h2>16. Contact</h2>
                <p>
                    For questions about these Terms, contact us at:
                </p>
                <ul>
                    <li><strong>Email:</strong> legal@kabadiyo.com</li>
                    <li><strong>Phone:</strong> +91 8586040076</li>
                </ul>

                <div className="mt-12 p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2024 Kabadiyo. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    )
}
