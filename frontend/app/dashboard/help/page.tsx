'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, Phone, Mail, MessageSquare, Book, Shield, Car, Wrench, CreditCard, Calendar, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Membership Questions
  {
    category: 'Membership',
    question: 'What does my membership include?',
    answer: 'Your Membership Auto subscription covers all routine maintenance and repairs for your vehicle. This includes oil changes, brake service, tire rotations, engine repairs, transmission service, diagnostics, and much more. There are no deductibles or surprise bills - just one simple monthly fee.'
  },
  {
    category: 'Membership',
    question: 'Can I add multiple vehicles to my membership?',
    answer: 'Yes! You can add multiple vehicles to your account. Each vehicle requires its own membership plan, chosen based on the vehicle type (compact, mid-size, SUV/truck, or luxury/performance).'
  },
  {
    category: 'Membership',
    question: 'What if I sell my car or get a new one?',
    answer: 'You can easily swap vehicles on your membership. Simply remove your old vehicle and add your new one through the dashboard. Your membership will continue without interruption. Note that plan pricing may change based on your new vehicle type.'
  },
  {
    category: 'Membership',
    question: 'How do I cancel my membership?',
    answer: 'You can cancel your membership at any time from your Account Settings page. Your coverage will remain active until the end of your current billing period. We hope you\'ll stay, but we make leaving easy.'
  },
  // Service Questions
  {
    category: 'Services',
    question: 'What repairs are NOT covered?',
    answer: 'We cover almost everything, but there are some exclusions: collision/accident damage, glass replacement, damage from abuse or neglect, racing/competition use, pre-existing conditions at the time of enrollment, and cosmetic/bodywork repairs.'
  },
  {
    category: 'Services',
    question: 'Can I use any shop for service?',
    answer: 'For your service to be covered, you must visit one of our authorized Membership Auto service centers. You can find your nearest location using the Store Locator in your dashboard. We\'re continuously expanding our network.'
  },
  {
    category: 'Services',
    question: 'How do I schedule a service appointment?',
    answer: 'Simply go to the Appointments section in your dashboard, select your vehicle and preferred location, choose an available time slot, and confirm your booking. You\'ll receive confirmation via email and can manage your appointment from the dashboard.'
  },
  {
    category: 'Services',
    question: 'What if my car breaks down?',
    answer: 'If you experience a breakdown, contact our support team immediately through the app or call our 24/7 helpline. We\'ll help coordinate assistance and get your vehicle to the nearest service center. Towing to our service center is included for members.'
  },
  // Billing Questions
  {
    category: 'Billing',
    question: 'When am I billed?',
    answer: 'You\'re billed on the same date each month that you originally signed up. If that date doesn\'t exist in a given month (like the 31st), you\'ll be billed on the last day of that month.'
  },
  {
    category: 'Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover). You can update your payment method at any time in your Account Settings.'
  },
  {
    category: 'Billing',
    question: 'Do you offer any discounts?',
    answer: 'Yes! We offer discounts for annual prepayment (save 2 months), referrals (1 free month when your friend joins), and military/first responder discounts. Contact support to learn more about eligibility.'
  },
  // Technical Questions
  {
    category: 'Technical',
    question: 'How do I update my vehicle information?',
    answer: 'Go to the Vehicles section in your dashboard. Click on the vehicle you want to update, then select "Edit." You can update the odometer reading, VIN, and other details. Keeping your mileage current helps us provide accurate service recommendations.'
  },
  {
    category: 'Technical',
    question: 'How do I reset my password?',
    answer: 'You can reset your password from the Account Settings page while logged in, or use the "Forgot Password" link on the login page if you\'re locked out. A reset link will be sent to your registered email address.'
  },
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We never share your personal information with third parties without your consent. Our systems are regularly audited for security compliance.'
  },
];

const categories = ['All', 'Membership', 'Services', 'Billing', 'Technical'];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--gold)] mb-4">Help Center</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <a
            href="tel:+15551234567"
            className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-all group"
          >
            <Phone className="w-8 h-8 text-[var(--gold)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Call Us</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">Available 24/7 for emergencies</p>
            <p className="text-[var(--gold)] font-semibold group-hover:underline">(555) 123-4567</p>
          </a>

          <a
            href="mailto:support@membershipauto.com"
            className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-all group"
          >
            <Mail className="w-8 h-8 text-[var(--gold)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Email Support</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">We respond within 24 hours</p>
            <p className="text-[var(--gold)] font-semibold group-hover:underline">support@membershipauto.com</p>
          </a>

          <Link
            href="/dashboard/chat"
            className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-all group"
          >
            <MessageSquare className="w-8 h-8 text-[var(--gold)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Live Chat</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">Chat with our team instantly</p>
            <p className="text-[var(--gold)] font-semibold group-hover:underline flex items-center gap-1">
              Open Chat <ExternalLink className="w-4 h-4" />
            </p>
          </Link>
        </div>

        {/* Membership Summary */}
        <div className="bg-gradient-to-r from-[var(--gold)]/10 to-transparent border-l-4 border-[var(--gold)] rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--gold)]" />
            Your Membership Includes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-[var(--gold)] mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">All Repairs</p>
                <p className="text-sm text-[var(--text-muted)]">Engine, transmission, brakes & more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Car className="w-5 h-5 text-[var(--gold)] mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Maintenance</p>
                <p className="text-sm text-[var(--text-muted)]">Oil, tires, filters & fluids</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--gold)] mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Diagnostics</p>
                <p className="text-sm text-[var(--text-muted)]">Full vehicle inspections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[var(--gold)] mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Priority Service</p>
                <p className="text-sm text-[var(--text-muted)]">Members get priority booking</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <Book className="w-6 h-6 text-[var(--gold)]" />
            Frequently Asked Questions
          </h2>

          {/* Search & Filter */}
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-[var(--gold)] text-[#0d0d0d]'
                        : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--gold)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-[var(--surface)] rounded-lg border border-[var(--border-color)]">
                <HelpCircle className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">No FAQs found matching your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-4 text-[var(--gold)] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--background)]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 text-xs font-medium bg-[var(--gold)]/10 text-[var(--gold)] rounded">
                        {faq.category}
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--gold)] transition-transform flex-shrink-0 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="pl-[88px] text-[var(--text-secondary)] leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Still Need Help?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-xl mx-auto">
            Our support team is here to help you with any questions or concerns. 
            Don't hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/chat"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold"
            >
              <MessageSquare className="w-5 h-5" />
              Start Live Chat
            </Link>
            <a
              href="tel:+15551234567"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--gold)] text-[var(--gold)] rounded-lg hover:bg-[var(--gold)] hover:text-[#0d0d0d] transition-colors font-semibold"
            >
              <Phone className="w-5 h-5" />
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
