'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import Link from "next/link";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PlansPage() {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(2); // Start with Premium (index 2)
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handlePrevPlan = () => {
    setCurrentPlanIndex((prev) => (prev > 0 ? prev - 1 : plans.length - 1));
  };

  const handleNextPlan = () => {
    setCurrentPlanIndex((prev) => (prev < plans.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next plan
      handleNextPlan();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right - previous plan
      handlePrevPlan();
    }
  };
  const plans = [
    {
      name: "Basic",
      price: 59,
      vehicles: "Compact Cars",
      examples: "Corolla, Civic, Sentra",
      features: [
        "All basic maintenance",
        "Oil changes",
        "Tire rotations",
        "Basic diagnostics",
      ],
    },
    {
      name: "Plus",
      price: 79,
      vehicles: "Mid-Size Cars",
      examples: "Camry, Accord, Malibu",
      features: [
        "Everything in Basic",
        "Brake service",
        "Belt replacements",
        "Fluid flushes",
      ],
    },
    {
      name: "Premium",
      price: 99,
      vehicles: "SUVs & Trucks",
      examples: "F-150, Tahoe, Explorer",
      features: [
        "Everything in Plus",
        "Engine repairs",
        "Transmission service",
        "Advanced diagnostics",
      ],
    },
    {
      name: "Elite",
      price: 159,
      vehicles: "Luxury/Performance",
      examples: "BMW, Lexus, Tesla",
      features: [
        "Everything in Premium",
        "Premium parts",
        "Priority scheduling",
        "Concierge service",
      ],
    },
  ];

  const covered = [
    "Brakes",
    "Tires",
    "Oil",
    "Belts",
    "Wipers",
    "Bulbs",
    "Engines",
    "Transmissions",
    "Fluid flushes",
    "Diagnostics",
    "Alignments",
    "And more",
  ];

  const notCovered = [
    "Bodywork",
    "Glass",
    "Abuse",
    "Neglect",
    "Racing",
    "Pre-existing issues",
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
            All-Inclusive Vehicle Coverage for One Low Monthly Fee
          </h1>
        </div>
      </section>

      {/* Plan Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="max-w-sm mx-auto">
              {/* Card Container */}
              <div 
                className="relative overflow-hidden"
                style={{ minHeight: '600px' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Current Plan Card */}
                {plans.map((plan, index) => (
                  <div
                    key={plan.name}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === currentPlanIndex 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div
                      className={`rounded-lg shadow-2xl p-8 h-full ${
                        index === 2
                          ? "bg-[var(--surface)] text-[var(--foreground)] border-2 border-[var(--gold)]"
                          : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)]"
                      }`}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-lg">/mo</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2 font-semibold">
                          Vehicles Covered
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {plan.vehicles}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                          {plan.examples}
                        </p>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <svg
                              className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                                index === 2
                                  ? "text-[var(--gold)]"
                                  : "text-[var(--gold)]/70"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-[var(--text-secondary)]">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/signup"
                        className={`block w-full text-center py-3 px-6 rounded-full font-semibold transition-all duration-200 ${
                          index === 2
                            ? "bg-[var(--gold)] text-[#0d0d0d] hover:bg-[#d8b87f] shadow-lg hover:shadow-xl"
                            : "bg-transparent border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(203,168,110,0.1)]"
                        }`}
                      >
                        Sign Up Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - Outside card container */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrevPlan}
                  className="p-4 rounded-full bg-[var(--gold)] text-[#0d0d0d] hover:bg-[#d8b87f] transition-all shadow-lg active:scale-95"
                  aria-label="Previous plan"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Plan Indicators */}
                <div className="flex gap-2">
                  {plans.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPlanIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentPlanIndex 
                          ? 'w-8 bg-[var(--gold)]' 
                          : 'w-2 bg-[var(--border-color)]'
                      }`}
                      aria-label={`Go to plan ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextPlan}
                  className="p-4 rounded-full bg-[var(--gold)] text-[#0d0d0d] hover:bg-[#d8b87f] transition-all shadow-lg active:scale-95"
                  aria-label="Next plan"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Swipe Hint */}
              <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                Swipe or use arrows to view other plans
              </p>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-lg shadow-lg p-8 transition-all duration-300 cursor-pointer ${
                  index === 2
                    ? "bg-[var(--surface)] text-[var(--foreground)] transform scale-105 border border-[var(--gold)] shadow-xl hover:scale-110 hover:shadow-2xl hover:border-[#d8b87f]"
                    : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] hover:scale-105 hover:border-[var(--gold)] hover:shadow-2xl hover:-translate-y-2"
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-lg">/mo</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2 font-semibold">
                    Vehicles Covered
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {plan.vehicles}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    {plan.examples}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                          index === 2
                            ? "text-[var(--gold)]"
                            : "text-[var(--gold)]/70"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 px-6 rounded-full font-semibold transition-all duration-200 ${
                    index === 2
                      ? "bg-[var(--gold)] text-[#0d0d0d] hover:bg-[#d8b87f] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-transparent border border-[var(--gold)] text-[var(--gold)] hover:bg-[rgba(203,168,110,0.1)]"
                  }`}
                >
                  Sign Up Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-8 text-center">
              What's Covered
            </h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {covered.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center p-3 md:p-4 bg-[var(--surface)] rounded-lg border border-[var(--border-color)]"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-[var(--gold)] mr-2 md:mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-[var(--foreground)] text-xs md:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Not Covered */}
      <section className="py-20 bg-[#111111]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-8 text-center">
              What's Not Covered
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {notCovered.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center p-4 bg-[var(--surface)] rounded-lg border border-[var(--border-color)]"
                >
                  <svg
                    className="w-5 h-5 text-[var(--error)] mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-[var(--foreground)] text-sm md:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compare vs Warranty */}
      <section className="py-20 bg-[#0d0d0d] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-6">
            Membership Auto covers more than an extended warranty, for less.
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
            Unlike traditional warranties, we cover maintenance, repairs, and provide ongoing service - all for one predictable monthly fee.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign Up Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded-full hover:bg-[rgba(203,168,110,0.1)] transition-all duration-200"
            >
              Schedule a Free Vehicle Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

