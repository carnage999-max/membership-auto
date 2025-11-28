import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Pick Your Plan",
      description: "Choose the perfect tier for your vehicle - from compact cars to luxury vehicles.",
      icon: "📋",
    },
    {
      number: 2,
      title: "Qualify Your Vehicle",
      description: "Quick vehicle inspection to ensure your car qualifies for coverage.",
      icon: "🚗",
    },
    {
      number: 3,
      title: "Start Using Your Benefits",
      description: "Begin using your membership immediately for all covered services.",
      icon: "✅",
    },
    {
      number: 4,
      title: "Come In Anytime",
      description: "Schedule service when it's convenient for you - no appointments needed for most services.",
      icon: "📅",
    },
    {
      number: 5,
      title: "Never Worry About the Cost",
      description: "All covered repairs and maintenance included. Just pay your monthly fee.",
      icon: "💰",
    },
  ];

  const faqs = [
    {
      question: "Do you cover breakdowns?",
      answer: "Yes! All mechanical breakdowns are covered under your membership plan, as long as they're not due to abuse, neglect, or pre-existing conditions.",
    },
    {
      question: "Can I use any shop?",
      answer: "You can use any of our certified service centers. We have locations throughout your area for your convenience.",
    },
    {
      question: "How do you make money?",
      answer: "We operate on a subscription model, similar to a gym membership. This allows us to provide better service at lower costs through volume and efficiency.",
    },
    {
      question: "What if I sell my car?",
      answer: "You can transfer your membership to your new vehicle (subject to qualification) or cancel with 30 days notice. No long-term contracts.",
    },
    {
      question: "Are there any deductibles?",
      answer: "No deductibles! All covered services are included in your monthly membership fee.",
    },
    {
      question: "What if I need a repair that's not covered?",
      answer: "We'll provide a transparent quote for any non-covered services. You're never obligated to proceed, and we'll always explain what's covered and what's not.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
            How It Works
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Getting started is simple. Follow these five easy steps to join thousands of satisfied members.
          </p>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-[var(--surface)] border border-[var(--gold)] rounded-full flex items-center justify-center text-6xl shadow-lg shadow-black/60">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block bg-[rgba(203,168,110,0.1)] text-[var(--gold)] px-4 py-1 rounded-full text-sm font-semibold mb-4">
                      Step {step.number}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-[var(--text-secondary)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border-color)]"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#111111] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of vehicle owners who never worry about repair bills again.
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View Plans & Pricing
          </Link>
        </div>
      </section>
    </div>
  );
}

