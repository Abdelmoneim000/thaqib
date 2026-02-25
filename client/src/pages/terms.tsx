import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service & Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: February 2026</p>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
                    {/* Terms of Service */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>

                        <h3 className="text-lg font-medium mt-6 mb-2">1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using the Thaqib platform ("Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, you may not use the Platform.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">2. Platform Description</h3>
                        <p>
                            Thaqib is a data analytics marketplace that connects organizations ("Clients") with data analysts ("Analysts").
                            The Platform facilitates project creation, analyst matching, data analysis, and dashboard delivery.
                            All interactions are supervised by Platform administrators.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">3. User Accounts</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>You must provide accurate and complete registration information.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You must be at least 18 years of age to create an account.</li>
                            <li>One person may only maintain one account.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">4. Client Responsibilities</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Clients must own or have proper authorization to upload any datasets to the Platform.</li>
                            <li>Clients must provide accurate project descriptions and requirements.</li>
                            <li>Clients understand that analyst assignment is managed by Platform administrators.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">5. Analyst Responsibilities</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Analysts must provide accurate information about their skills and qualifications.</li>
                            <li>Analysts must not download, copy, or redistribute any client data outside the Platform.</li>
                            <li>Analysts must deliver quality work within agreed timelines.</li>
                            <li>Analysts must maintain confidentiality of all client information.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">6. Data Usage</h3>
                        <p>
                            All datasets uploaded to the Platform remain the property of the uploading party.
                            Data is used solely for the purpose of the assigned analysis project.
                            <strong>Downloading of datasets is prohibited for security purposes.</strong>
                            All data analysis must be performed within the Platform.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">7. Platform Administration</h3>
                        <p>
                            Platform administrators reserve the right to review all projects, approve or reject analyst applications,
                            and take any necessary action to ensure Platform integrity and security.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">8. Termination</h3>
                        <p>
                            We reserve the right to suspend or terminate any account that violates these terms,
                            engages in fraudulent activity, or compromises Platform security.
                        </p>
                    </section>

                    {/* Privacy Policy */}
                    <section className="border-t pt-8">
                        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>

                        <h3 className="text-lg font-medium mt-6 mb-2">1. Information We Collect</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Account Information:</strong> Name, email, phone number, organization, professional title, and skills.</li>
                            <li><strong>Project Data:</strong> Datasets, project descriptions, and analysis outputs.</li>
                            <li><strong>Communications:</strong> Messages exchanged through the Platform chat system.</li>
                            <li><strong>Usage Data:</strong> Login history, page visits, and feature usage for service improvement.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">2. How We Use Your Information</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>To provide and maintain the Platform services.</li>
                            <li>To match analysts with appropriate projects.</li>
                            <li>To facilitate communication between users.</li>
                            <li>To ensure Platform security and prevent unauthorized access.</li>
                            <li>To improve our services and user experience.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">3. Data Security</h3>
                        <p>
                            We implement robust security measures including:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Encrypted sessions and secure authentication.</li>
                            <li>Role-based access controls — users only see data relevant to their role.</li>
                            <li>No-download policy — datasets cannot be downloaded from the Platform.</li>
                            <li>Admin-supervised analyst assignment for additional oversight.</li>
                            <li>Secure password hashing using industry-standard algorithms.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">4. Data Sharing</h3>
                        <p>
                            We do not sell or share your personal information with third parties.
                            Data is only shared between project participants (Client, assigned Analyst, and Administrators)
                            as necessary to fulfill project requirements.
                        </p>

                        <h3 className="text-lg font-medium mt-6 mb-2">5. Your Rights</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access and update your personal information through your account settings.</li>
                            <li>Request deletion of your account and associated data.</li>
                            <li>Opt out of non-essential communications.</li>
                        </ul>

                        <h3 className="text-lg font-medium mt-6 mb-2">6. Contact Us</h3>
                        <p>
                            For questions about these terms or our privacy practices, please contact us through the Platform's contact form
                            or reach out to our support team.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
