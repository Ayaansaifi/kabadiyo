export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-6">
                    Last updated: December 2024
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Name and phone number during registration</li>
                    <li>Pickup address for scheduling orders</li>
                    <li>Chat messages between users and Kabadiwalas</li>
                    <li>Order history and transaction details</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Facilitate scrap pickup services</li>
                    <li>Connect you with verified Kabadiwalas</li>
                    <li>Process orders and payments</li>
                    <li>Improve our services</li>
                    <li>Send important updates about your orders</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. Data Security</h2>
                <p>
                    We implement industry-standard security measures to protect your personal
                    information. Passwords are encrypted using bcrypt hashing.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing</h2>
                <p>We do not sell your personal information. We share data only with:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Kabadiwalas you choose to connect with (phone & address for pickup)</li>
                    <li>Service providers who assist in app operations</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and data</li>
                    <li>Opt out of marketing communications</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">6. Cookies</h2>
                <p>
                    We use essential cookies for authentication and session management.
                    No third-party tracking cookies are used.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
                <p>
                    For privacy-related questions, contact us at:<br />
                    Email: privacy@kabadiwala.app<br />
                    Phone: +91 9876543210
                </p>
            </div>
        </div>
    )
}
