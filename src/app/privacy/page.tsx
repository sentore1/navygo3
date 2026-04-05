import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />
      <div className="container py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-8 text-sm leading-relaxed">
          <p className="text-muted-foreground">Last updated: January 2025</p>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Account information (name, email, password)</li>
              <li>Goal data and progress tracking</li>
              <li>Communication preferences</li>
              <li>Support requests and feedback</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Provide and maintain our goal tracking services</li>
              <li>Send you updates about your goals and progress</li>
              <li>Respond to your support requests</li>
              <li>Improve our platform and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
            <p className="text-muted-foreground">We do not sell, trade, or rent your personal information to third parties. We may share your information only in limited circumstances, such as with your consent or to comply with legal requirements.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us at privacy@navygoal.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}