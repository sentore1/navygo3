import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />
      <div className="container py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-8 text-sm leading-relaxed">
          <p className="text-muted-foreground">Last updated: January 2025</p>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing and using NavyGoal, you accept and agree to be bound by these terms. If you do not agree to these terms, please do not use our service.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
            <p className="text-muted-foreground">NavyGoal is a goal tracking and achievement platform that helps users set, monitor, and accomplish their personal and professional objectives through visual progress tracking and milestone celebrations.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
            <p className="mb-2">When creating an account, you agree to:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
            <p className="mb-2">You may not use NavyGoal to:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious code or spam</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for commercial purposes without permission</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground">NavyGoal and its content are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your goal data, but grant us a license to use it to provide our services.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Termination</h2>
            <p className="text-muted-foreground">We may terminate or suspend your account at any time for violations of these terms. You may also delete your account at any time through your account settings.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground">NavyGoal is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-muted-foreground">We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
            <p className="text-muted-foreground">For questions about these Terms of Service, please contact us at legal@navygoal.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}