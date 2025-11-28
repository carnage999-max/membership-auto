import Link from "next/link";

export default function WhyUsPage() {
  const certifications = [
    { name: "ASE Certified", icon: "🔧" },
    { name: "EPA Compliant", icon: "🌱" },
    { name: "BBB A+", icon: "⭐" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
            Fixing an Industry That's Been Broken for 100 Years.
          </h1>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-64 h-64 bg-[var(--surface)] border border-[var(--gold)] rounded-full mx-auto md:mx-0 flex items-center justify-center text-8xl mb-8 shadow-xl shadow-black/60">
                  👨‍🔧
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Meet Nathan Reardon
                </h2>
                <p className="text-lg text-[var(--text-secondary)] mb-4 leading-relaxed">
                  <strong>ASE Double Master Tech</strong> with 25+ years in the automotive industry.
                </p>
                <p className="text-lg text-[var(--text-secondary)] mb-4 leading-relaxed">
                  After decades of seeing customers shocked by unexpected repair bills and dishonest service practices, Nathan created Membership Auto to fundamentally change how vehicle maintenance works.
                </p>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  His vision: <strong>End surprise repair bills and dishonest service</strong> by creating a transparent, subscription-based model that puts customers first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-8">
              Our Mission
            </h2>
            <div className="bg-[var(--surface)] rounded-lg shadow-lg p-12 border-l-4 border-[var(--gold)]">
              <p className="text-2xl md:text-3xl text-[var(--foreground)] leading-relaxed italic">
                "To give every vehicle owner peace of mind, fair pricing, and the highest standards of automotive care."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-12 text-center">
              Certifications & Partnerships
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-[var(--surface)] rounded-lg p-8 text-center border border-[var(--border-color)]"
                >
                  <div className="text-6xl mb-4">{cert.icon}</div>
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">
                    {cert.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-12 text-center">
              What Sets Us Apart
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[var(--surface)] rounded-lg p-8 shadow-sm border border-[var(--border-color)]">
                <div className="text-5xl mb-4">💎</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  Transparency
                </h3>
                <p className="text-[var(--text-secondary)]">
                  No hidden fees, no surprise charges. You know exactly what you're paying for.
                </p>
              </div>
              <div className="bg-[var(--surface)] rounded-lg p-8 shadow-sm border border-[var(--border-color)]">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  Honesty
                </h3>
                <p className="text-[var(--text-secondary)]">
                  We'll never recommend unnecessary repairs. Our reputation depends on your trust.
                </p>
              </div>
              <div className="bg-[var(--surface)] rounded-lg p-8 shadow-sm border border-[var(--border-color)]">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                  Innovation
                </h3>
                <p className="text-[var(--text-secondary)]">
                  We're revolutionizing an industry that's been stuck in the past for too long.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0d0d0d] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-6">
            Join the Revolution
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Be part of the movement that's changing how vehicle maintenance works forever.
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}

