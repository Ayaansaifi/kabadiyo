import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
    title: "Privacy Policy | Kabadiyo",
    description: "Privacy Policy for Kabadiyo - India's #1 Scrap Selling App"
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold">Privacy Policy</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-3xl prose prose-neutral dark:prose-invert">
                <p className="text-muted-foreground">Last Updated: December 31, 2024</p>

                <h2>1. Introduction</h2>
                <p>
                    Welcome to <strong>Kabadiyo</strong> ("we", "our", "us"). We are committed to protecting your personal
                    information and your right to privacy. This Privacy Policy explains how we collect, use, disclose,
                    and safeguard your information when you use our mobile application and website.
                </p>

                <h2>2. Information We Collect</h2>
                <h3>Personal Information</h3>
                <ul>
                    <li><strong>Name:</strong> To personalize your experience and communication.</li>
                    <li><strong>Phone Number:</strong> For account verification (OTP) and service coordination.</li>
                    <li><strong>Email Address:</strong> For account recovery and important notifications.</li>
                    <li><strong>Address:</strong> To schedule scrap pickups at your location.</li>
                    <li><strong>Profile Photo:</strong> To enhance your profile visibility (optional).</li>
                </ul>

                <h3>Usage Data</h3>
                <ul>
                    <li>Device information (model, OS version)</li>
                    <li>App usage statistics</li>
                    <li>Crash reports for app improvement</li>
                </ul>

                <h3>Location Data</h3>
                <p>
                    We collect approximate location data to help you find nearby Kabadiwalas (scrap dealers)
                    and to optimize pickup routes. This is only collected when you use the "Find Near Me" feature.
                </p>

                <h2>3. How We Use Your Information</h2>
                <ul>
                    <li>To provide and maintain our service</li>
                    <li>To process scrap pickup requests</li>
                    <li>To connect you with verified Kabadiwalas</li>
                    <li>To send OTP for secure login</li>
                    <li>To communicate service updates and promotions</li>
                    <li>To improve app performance and user experience</li>
                </ul>

                <h2>4. Data Sharing & Third Parties</h2>
                <p>
                    We do <strong>NOT</strong> sell your personal data. We may share limited information with:
                </p>
                <ul>
                    <li><strong>Kabadiwalas:</strong> Your name, phone, and address (only for confirmed pickups).</li>
                    <li><strong>Service Providers:</strong> Cloud hosting (Vercel), database (Neon PostgreSQL).</li>
                    <li><strong>Legal Requirements:</strong> If required by law enforcement or court order.</li>
                </ul>

                <h2>5. Data Security</h2>
                <p>
                    We implement industry-standard security measures including:
                </p>
                <ul>
                    <li>AES-256 encryption for sensitive data</li>
                    <li>HTTPS for all communications</li>
                    <li>Regular security audits</li>
                    <li>Secure password hashing (bcrypt)</li>
                </ul>

                <h2>6. Your Rights</h2>
                <p>Under applicable Indian laws (IT Act 2000) and GDPR (if applicable), you have the right to:</p>
                <ul>
                    <li><strong>Access:</strong> Request a copy of your personal data.</li>
                    <li><strong>Correction:</strong> Update inaccurate information in your profile.</li>
                    <li><strong>Deletion:</strong> Request permanent deletion of your account and data.</li>
                    <li><strong>Portability:</strong> Export your data in a common format.</li>
                </ul>

                <h2>7. Account Deletion</h2>
                <p>
                    You can delete your account at any time through <strong>Settings → Delete Account</strong>.
                    Upon deletion:
                </p>
                <ul>
                    <li>All personal data will be permanently removed within 30 days.</li>
                    <li>Chat messages may be retained in anonymized form for service improvement.</li>
                    <li>Transaction records may be retained for legal compliance (up to 7 years).</li>
                </ul>

                <h2>8. Children's Privacy</h2>
                <p>
                    Our service is not intended for users under 13 years of age. We do not knowingly collect
                    data from children. If you believe a child has provided us with personal information,
                    please contact us.
                </p>

                <h2>9. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant
                    changes via email or in-app notification. The "Last Updated" date at the top will reflect
                    the most recent revision.
                </p>

                <h2>10. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy or your data, please contact us:
                </p>
                <ul>
                    <li><strong>Email:</strong> privacy@kabadiyo.com</li>
                    <li><strong>Phone:</strong> +91 8586040076</li>
                    <li><strong>Address:</strong> Kabadiyo Technologies, New Delhi, India</li>
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
