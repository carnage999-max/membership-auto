export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | Membership Auto',
  description: 'Privacy policy for Membership Auto - Learn how we protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] border-b border-[var(--border-color)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-4">Privacy Policy</h1>
          <p className="text-[var(--text-secondary)] text-lg">Global Privacy Policy — Gold Standard Edition</p>
          <p className="text-[var(--text-muted)] mt-2">Last Updated: December 24, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8 text-[var(--text-secondary)]">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="leading-relaxed">
              This Global Privacy Policy (the "Policy") describes how Membership Auto ("Company," "we," "our," or "us") 
              collects, uses, discloses, and safeguards personal information across all current and future websites, 
              subdomains, and online services (collectively, the "Services"). This Policy sets a global standard for 
              privacy compliance and data protection in accordance with the highest international legal frameworks, 
              including but not limited to the General Data Protection Regulation (EU) 2016/679 ("GDPR"), the California 
              Consumer Privacy Act and Privacy Rights Act (CCPA/CPRA), the Virginia Consumer Data Protection Act (VCDPA), 
              the Canadian Personal Information Protection and Electronic Documents Act (PIPEDA), and the Brazilian General 
              Data Protection Law (LGPD). It applies to all users regardless of geographic location.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Scope and Applicability</h2>
            <p className="leading-relaxed">
              This Policy applies to all visitors, customers, and users of our Services, and to all data collected online 
              or offline through any form of interaction. By using our Services, you consent to the practices described herein.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We collect personal data directly and automatically, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Identifiers (name, email, phone number, address)</li>
              <li>Commercial data (transactions, purchases, payment methods)</li>
              <li>Biometric and health data (where applicable)</li>
              <li>Geolocation information</li>
              <li>Internet activity and behavioral analytics</li>
              <li>Device identifiers</li>
              <li>Any other data required for lawful and legitimate business operations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Automated and AI‑Based Processing</h2>
            <p className="leading-relaxed">
              We utilize Artificial Intelligence and Machine Learning ("AI/ML") technologies to analyze behavioral data, 
              enhance service personalization, detect fraud, and improve user experience. Automated decision‑making may 
              influence personalized recommendations or fraud prevention mechanisms, never without appropriate human oversight 
              and legal safeguards.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. How We Use Information</h2>
            <p className="leading-relaxed">
              We process data for legitimate business purposes: service delivery, account management, communication, compliance, 
              analytics, marketing, personalization, and platform security. Processing is always grounded in a lawful basis under 
              applicable law.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Disclosure and Data Sharing</h2>
            <p className="leading-relaxed">
              We do not sell personal data. We share information only with trusted service providers, payment processors, affiliates, 
              analytics vendors, and legal authorities when required by law. Each third‑party partner is contractually obligated to 
              maintain equivalent data protection standards.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. International Data Transfers</h2>
            <p className="leading-relaxed">
              Data may be processed and stored in the United States and other jurisdictions. All transfers comply with GDPR Chapter V 
              and equivalent safeguards through Standard Contractual Clauses, adequacy decisions, or binding corporate rules.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p className="leading-relaxed">
              Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected or as required 
              by law. Retention schedules are periodically reviewed for compliance and minimization.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p className="leading-relaxed">
              We comply with the Children's Online Privacy Protection Act (COPPA) and do not knowingly collect data from children under 
              13 years old (or 16 in applicable jurisdictions) without verifiable parental consent. Parents may contact us to review or 
              delete their child's data at any time.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Your Rights</h2>
            <p className="leading-relaxed">
              Depending on your jurisdiction, you may have the right to access, correct, delete, restrict processing, object to 
              processing, port your data, or withdraw consent. Requests can be submitted using the contact information below.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Security and Safeguards</h2>
            <p className="leading-relaxed">
              We employ administrative, technical, and physical safeguards that meet or exceed industry standards, including encryption, 
              pseudonymization, role‑based access controls, multi‑factor authentication, and continuous threat monitoring.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Cookies and Tracking Technologies</h2>
            <p className="leading-relaxed">
              We use cookies, web beacons, and similar tools for site functionality, analytics, and marketing. Users can control cookie 
              preferences via browser settings or our Cookie Management Tool.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Cross‑Border Compliance</h2>
            <p className="leading-relaxed">
              This Policy incorporates global privacy principles such as lawfulness, fairness, transparency, purpose limitation, data 
              minimization, accuracy, integrity, and accountability. These principles apply uniformly across all operations and subsidiaries.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Data Protection Officer and Contact</h2>
            <p className="leading-relaxed mb-4">
              We maintain a designated Data Protection Officer ("DPO") to oversee compliance. Users may exercise their rights or submit 
              complaints via:
            </p>
            <div className="bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-6">
              <p className="mb-2"><strong>Email:</strong> privacy@membershipauto.com</p>
              <p><strong>Mail:</strong> Membership Auto, Detroit, ME 04929, USA</p>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Policy to reflect legal, technical, or business developments. The latest version will always be available 
              on our website, with a new 'Last Updated' date. Continued use of our Services constitutes acceptance of any modifications.
            </p>
          </section>

          {/* Footer */}
          <section className="border-t border-[var(--border-color)] pt-8 mt-12">
            <p className="text-[var(--text-muted)] text-sm">
              © 2025 Membership Auto. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
