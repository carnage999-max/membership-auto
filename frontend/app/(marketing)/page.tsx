import Image from "next/image";
import Link from "next/link";
import { 
  Banknote, 
  AlertCircle, 
  AlertTriangle, 
  Wallet, 
  ShieldCheck, 
  Ban, 
  ClipboardList, 
  Play, 
  Star 
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background with dark premium gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[#111111] to-[var(--surface)]">
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
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[var(--background)] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              <div className="p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-color)]">
                <Banknote className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Unpredictable repair bills</h3>
                <p className="text-[var(--text-secondary)]">One day it's $200, the next it's $3,000. You never know what's coming.</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-color)]">
                <AlertCircle className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Dishonest mechanics</h3>
                <p className="text-[var(--text-secondary)]">Being upsold on unnecessary repairs you don't actually need.</p>
              </div>
              <div className="p-6 rounded-lg bg-[var(--surface)] border border-[var(--border-color)]">
                <AlertTriangle className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Delayed maintenance = dangerous cars</h3>
                <p className="text-[var(--text-secondary)]">Putting off repairs because you can't afford them puts you at risk.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
              We're fixing the broken auto repair industry.
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <Wallet className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Monthly subscription plan</h3>
                <p className="text-[var(--text-secondary)]">One predictable monthly fee. No surprises, no hidden costs.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <ShieldCheck className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">Covers all repairs & maintenance*</h3>
                <p className="text-[var(--text-secondary)]">From oil changes to engine repairs, we've got you covered.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <Ban className="w-12 h-12 text-[var(--gold)] mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-3">No deductibles, no hassle</h3>
                <p className="text-[var(--text-secondary)]">Just bring your car in. We handle the rest.</p>
              </div>
              <div className="p-8 rounded-lg bg-[var(--surface)] shadow-lg border border-[var(--border-color)]">
                <ClipboardList className="w-12 h-12 text-[var(--gold)] mb-4" />
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
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[var(--background)] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              Watch: How Membership Auto Works in 90 Seconds
            </h2>
            <div className="aspect-video bg-[var(--surface)] rounded-lg border border-[var(--border-color)] flex items-center justify-center mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[var(--gold)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-[var(--background)] ml-1" fill="currentColor" />
                </div>
                <p className="text-[var(--text-secondary)]">Video placeholder - Add your video embed here</p>
              </div>
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
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "I've saved over $2,500 in the first year alone. No more surprise bills!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[var(--background)] font-semibold mr-3">
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
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "Finally, honest mechanics and transparent pricing. This is how it should be."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[var(--background)] font-semibold mr-3">
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
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-4">
                  "Before: $1,200 repair bill. After: $0. Just my monthly membership fee."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[var(--gold)] rounded-full flex items-center justify-center text-[var(--background)] font-semibold mr-3">
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
              className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[var(--background)] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
