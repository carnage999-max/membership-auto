export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Service | Membership Auto',
  description: 'Terms of Service for Membership Auto - Read our terms and conditions',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] border-b border-[var(--border-color)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-4">Terms of Service</h1>
          <p className="text-[var(--text-secondary)] text-lg">Please read these terms carefully before using our service</p>
          <p className="text-[var(--text-muted)] mt-2">Last Updated: December 24, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8 text-[var(--text-secondary)]">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the Membership Auto website, application, and services (the "Service"), you accept and agree to be 
              bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this Service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Membership Auto's website 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this 
              license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, threaten, or defame any person or entity</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p className="leading-relaxed">
              The materials on Membership Auto's website are provided on an 'as is' basis. Membership Auto makes no warranties, expressed 
              or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other 
              violation of rights.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
            <p className="leading-relaxed">
              In no event shall Membership Auto or its suppliers be liable for any damages (including, without limitation, damages for 
              loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on 
              Membership Auto's website, even if Membership Auto or an authorized representative has been notified orally or in writing 
              of the possibility of such damage.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
            <p className="leading-relaxed">
              The materials appearing on Membership Auto's website could include technical, typographical, or photographic errors. 
              Membership Auto does not warrant that any of the materials on its website are accurate, complete, or current. Membership 
              Auto may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Links</h2>
            <p className="leading-relaxed">
              Membership Auto has not reviewed all of the sites linked to its website and is not responsible for the contents of any such 
              linked site. The inclusion of any link does not imply endorsement by Membership Auto of the site. Use of any such linked 
              website is at the user's own risk.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
            <p className="leading-relaxed">
              Membership Auto may revise these terms of service for its website at any time without notice. By using this website, you are 
              agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
            <p className="leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you 
              irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. User Account</h2>
            <p className="leading-relaxed mb-4">
              If you create an account on our Service, you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the confidentiality of your password</li>
              <li>Accepting responsibility for all activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring that all information you provide is accurate and complete</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Payment Terms</h2>
            <p className="leading-relaxed">
              By providing payment information, you authorize Membership Auto to charge your account for all charges and fees incurred 
              through your use of the Service. You agree to pay all charges that you incur, including applicable taxes and fees. All sales 
              are final unless explicitly stated otherwise.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Cancellation and Refund Policy</h2>
            <p className="leading-relaxed">
              Membership Auto offers a 30-day money-back guarantee. If you are not satisfied with your membership, you may request a full 
              refund within 30 days of your initial purchase. Refunds requested after 30 days will be evaluated on a case-by-case basis.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
            <p className="leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-6">
              <p className="mb-2"><strong>Email:</strong> support@membershipauto.com</p>
              <p className="mb-2"><strong>Phone:</strong> 207-947-1999</p>
              <p><strong>Mail:</strong> Membership Auto, P.O. Box 52, Detroit, ME 04929, USA</p>
            </div>
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
