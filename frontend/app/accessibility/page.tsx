export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accessibility Statement | Membership Auto',
  description: 'Accessibility statement for Membership Auto - We are committed to accessibility',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] border-b border-[var(--border-color)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-4">Accessibility Statement</h1>
          <p className="text-[var(--text-secondary)] text-lg">Commitment to Web Accessibility</p>
          <p className="text-[var(--text-muted)] mt-2">Last Updated: December 24, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8 text-[var(--text-secondary)]">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Accessibility</h2>
            <p className="leading-relaxed">
              Membership Auto is committed to ensuring digital accessibility for people with disabilities. We are continually improving 
              the user experience for everyone and applying the relevant accessibility standards. This commitment is part of our core values 
              and dedication to providing equal access to all our services and information.
            </p>
          </section>

          {/* Standards */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accessibility Standards</h2>
            <p className="leading-relaxed mb-4">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard. These guidelines explain how 
              to make web content more accessible to people with disabilities, and we believe following these guidelines will make our 
              website easier for all people to use.
            </p>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accessibility Features</h2>
            <p className="leading-relaxed mb-4">
              Our website includes the following accessibility features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Keyboard navigation and shortcuts</li>
              <li>Screen reader compatibility</li>
              <li>High contrast mode support</li>
              <li>Text resizing and zoom capabilities</li>
              <li>Descriptive alt text for images</li>
              <li>Clear and descriptive link text</li>
              <li>Captions for video content</li>
              <li>Focus indicators for keyboard users</li>
              <li>Skip to main content links</li>
              <li>Clear and simple language</li>
            </ul>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Known Limitations</h2>
            <p className="leading-relaxed mb-4">
              While we strive to make our entire website accessible, we recognize that there may be areas that don't fully meet accessibility 
              standards. Known limitations include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Some embedded third-party content may not be fully accessible</li>
              <li>Legacy pages may need further optimization</li>
              <li>Some interactive features may require additional accessibility improvements</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We are actively working to improve these areas and welcome feedback about accessibility issues.
            </p>
          </section>

          {/* Assistive Technology */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Assistive Technology Support</h2>
            <p className="leading-relaxed">
              Our website has been tested with and is compatible with the following assistive technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>JAWS (Job Access With Speech)</li>
              <li>NVDA (NonVisual Desktop Access)</li>
              <li>VoiceOver (Apple)</li>
              <li>ZoomText</li>
              <li>Dragon NaturallySpeaking</li>
              <li>Standard browser zoom and magnification tools</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Report Accessibility Issues</h2>
            <p className="leading-relaxed mb-4">
              If you encounter an accessibility barrier on our website or have suggestions for improvement, please contact us:
            </p>
            <div className="bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-6">
              <p className="mb-2"><strong>Email:</strong> accessibility@membershipauto.com</p>
              <p className="mb-2"><strong>Phone:</strong> 207-947-1999</p>
              <p className="mb-4"><strong>Mail:</strong> Membership Auto, P.O. Box 52, Detroit, ME 04929, USA</p>
              <p className="text-sm text-[var(--text-muted)]">
                Please include specific details about the issue and the page where you encountered it. We will respond to accessibility 
                concerns as quickly as possible, typically within 5-7 business days.
              </p>
            </div>
          </section>

          {/* Remediation */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Remediation Process</h2>
            <p className="leading-relaxed mb-4">
              Upon receiving an accessibility complaint, we will:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acknowledge receipt of the complaint within 24 hours</li>
              <li>Investigate the accessibility issue</li>
              <li>Provide a timeline for remediation</li>
              <li>Keep you updated on progress</li>
              <li>Implement fixes and test for compliance</li>
              <li>Follow up with you once the issue is resolved</li>
            </ul>
          </section>

          {/* Third-Party Content */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Content</h2>
            <p className="leading-relaxed">
              While we strive to ensure that all content on our website is accessible, some third-party content (such as embedded videos, 
              documents, or plugins) may be provided by external sources beyond our control. We encourage users to contact the third-party 
              provider directly regarding accessibility concerns about their content.
            </p>
          </section>

          {/* Continuous Improvement */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Continuous Improvement</h2>
            <p className="leading-relaxed">
              Web accessibility is an ongoing process. We regularly review and update our website to ensure compliance with accessibility 
              standards. We conduct accessibility audits, gather user feedback, and implement improvements to provide the best possible 
              experience for all users.
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
