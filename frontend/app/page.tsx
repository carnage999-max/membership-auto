import Image from "next/image";
import Link from "next/link";
import { DollarSign, AlertTriangle, CreditCard, CheckCircle, Shield, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background with dark premium gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#111111] to-[#1a1a1a]">
          {/* Foliage texture overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          </div>
        </div>

        {/* Hero Image - Right Side (contained, not full background) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center justify-end pr-10">
          <div className="relative w-[420px] max-w-[45vw] aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-2xl shadow-black/60">
            <Image
              src="/images/hero-image.jpeg"
              alt="Membership Auto Vehicle Service"
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 1024px) 60vw, 420px"
            />
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="max-w-2xl lg:max-w-4xl">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
              Never Pay for Car Repairs Again.
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Join the world's first subscription-based vehicle service & repair club. One low monthly fee. Zero surprise bills.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join Now
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded-full hover:bg-[rgba(203,168,110,0.1)] transition-all duration-200"
              >
                How It Works
              </Link>
            </div>

            {/* Trust Builders */}
            <div className="mb-8">
              <p className="text-white/70 text-sm mb-4 font-medium">Trusted by thousands of vehicle owners</p>
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">ASE Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">BBB A+</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">BG Products Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Valvoline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Quaker State</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tired of $3,000 repair surprises?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
                  <DollarSign className="w-8 h-8 text-red-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Unpredictable repair bills</h3>
                <p className="text-[var(--text-secondary)]">One day it's $200, the next it's $3,000. You never know what's coming.</p>
              </div>
              <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10">
                  <AlertTriangle className="w-8 h-8 text-orange-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Dishonest mechanics</h3>
                <p className="text-[var(--text-secondary)]">Being upsold on unnecessary repairs you don't actually need.</p>
              </div>
              <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Delayed maintenance = dangerous cars</h3>
                <p className="text-[var(--text-secondary)]">Putting off repairs because you can't afford them puts you at risk.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              We're fixing the broken auto repair industry.
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-[var(--gold)]/10">
                  <CreditCard className="w-8 h-8 text-[var(--gold)]" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Monthly subscription plan</h3>
                <p className="text-[var(--text-secondary)]">One predictable monthly fee. No surprises, no hidden costs.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
                  <CheckCircle className="w-8 h-8 text-green-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Covers all repairs & maintenance*</h3>
                <p className="text-[var(--text-secondary)]">From oil changes to engine repairs, we've got you covered.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10">
                  <Shield className="w-8 h-8 text-blue-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No deductibles, no hassle</h3>
                <p className="text-[var(--text-secondary)]">Just bring your car in. We handle the rest.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10">
                  <FileText className="w-8 h-8 text-purple-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Clear exclusions</h3>
                <p className="text-[var(--text-secondary)]">*Exclusions: collision, glass, abuse, pre-existing damage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Pricing Teaser */}
      <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
            Plans start at just $59/mo
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Choose the perfect tier for your vehicle
          </p>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View All Plans
          </Link>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Watch: How Membership Auto Works
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              See how we're revolutionizing vehicle service and repair
            </p>
            <div className="aspect-video bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] overflow-hidden shadow-2xl mt-8">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/LhtJpv6-au8"
                title="Membership Auto - How It Works"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              What Our Members Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "I've saved over $2,500 in the first year alone. No more surprise bills!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[#0d0d0d] font-semibold mr-3">
                    JS
                  </div>
                  <div>
                    <p className="font-semibold text-white">John Smith</p>
                    <p className="text-sm text-[var(--text-muted)]">Member since 2023</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "Finally, honest mechanics and transparent pricing. This is how it should be."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[#0d0d0d] font-semibold mr-3">
                    MJ
                  </div>
                  <div>
                    <p className="font-semibold text-white">Maria Johnson</p>
                    <p className="text-sm text-[var(--text-muted)]">Member since 2024</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "Before: $1,200 repair bill. After: $0. Just my monthly membership fee."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[#0d0d0d] font-semibold mr-3">
                    RW
                  </div>
                  <div>
                    <p className="font-semibold text-white">Robert Williams</p>
                    <p className="text-sm text-[var(--text-muted)]">Member since 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
            Ready to Never Worry About Repair Bills Again?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/plans"
              className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Find Your Plan
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded-full hover:bg-[rgba(203,168,110,0.1)] transition-all duration-200"
            >
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Banner - Bottom */}
      <div className="relative bg-[var(--surface)] border-t border-[var(--border-color)] py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <p className="text-[var(--text-secondary)] font-semibold text-lg md:text-xl">
            OUR MISSION IS TO ELIMINATE SURPRISE REPAIR BILLS AND CREATE A{" "}
            <span className="font-bold italic text-2xl md:text-3xl">STRESS-FREE</span>{" "}
            FUTURE FOR EVERY VEHICLE OWNER
          </p>
        </div>
      </div>
    </div>
  );
}
