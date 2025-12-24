export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-6">
                    Last updated: December 2024
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p>
                    By using Kabadiwala app, you agree to these Terms of Service. If you do not
                    agree, please do not use our services.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
                <p>
                    Kabadiwala is a platform that connects users who want to sell scrap materials
                    with verified Kabadiwalas (scrap collectors) in their area.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
                <ul className="list-disc pl-6 mb-4">
                    <li>You must provide accurate information during registration</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One account per phone number</li>
                    <li>You must be 18+ years to use this service</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
                <p>As a user, you agree to:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Provide accurate pickup addresses</li>
                    <li>Be available during scheduled pickup times</li>
                    <li>Not misuse the platform for illegal activities</li>
                    <li>Treat Kabadiwalas with respect</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">5. Kabadiwala Responsibilities</h2>
                <p>Kabadiwalas on our platform agree to:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Maintain accurate rate information</li>
                    <li>Honor scheduled pickups</li>
                    <li>Provide fair weighing and prompt payment</li>
                    <li>Maintain professional conduct</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">6. Payments</h2>
                <p>
                    All payments are made directly between users and Kabadiwalas. Kabadiwala app
                    does not process or hold any payments. The app is free to use for all users.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
                <p>
                    Kabadiwala app serves as a platform to connect users and Kabadiwalas. We are
                    not responsible for disputes, pricing disagreements, or issues between parties.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">8. Content Guidelines</h2>
                <p>Users must not post:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Offensive, illegal, or harmful content</li>
                    <li>Spam or promotional material</li>
                    <li>False or misleading information</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">9. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate accounts that violate these terms
                    or engage in fraudulent activity.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
                <p>
                    We may update these terms periodically. Continued use after changes constitutes
                    acceptance of new terms.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact</h2>
                <p>
                    For questions about these terms:<br />
                    Email: support@kabadiwala.app<br />
                    Phone: +91 9876543210
                </p>
            </div>
        </div>
    )
}
