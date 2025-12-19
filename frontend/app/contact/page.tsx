"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone, PhoneCall } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "non-member",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      // TODO: Replace with actual API call to backend
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form submitted:", formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        userType: "non-member",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again or contact us directly.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-20 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--gold)] mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions? We're here to help. Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {/* Live Chat */}
            <div className="bg-[var(--surface)] rounded-lg p-8 shadow-lg text-center border border-[var(--border-color)]">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10">
                <MessageCircle className="w-10 h-10 text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Live Chat</h3>
              <p className="text-[var(--text-secondary)] mb-4">Chat with us in real-time</p>
              <button className="w-full px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-full font-semibold hover:bg-[#d8b87f] transition-colors">
                Start Chat
              </button>
            </div>

            {/* Schedule Call */}
            <div className="bg-[var(--surface)] rounded-lg p-8 shadow-lg text-center border border-[var(--border-color)]">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10">
                <Phone className="w-10 h-10 text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Schedule Call</h3>
              <p className="text-[var(--text-secondary)] mb-4">Book a time that works for you</p>
              <button className="w-full px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-full font-semibold hover:bg-[#d8b87f] transition-colors">
                Schedule Now
              </button>
            </div>

            {/* Request Callback */}
            <div className="bg-[var(--surface)] rounded-lg p-8 shadow-lg text-center border border-[var(--border-color)]">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/10">
                <PhoneCall className="w-10 h-10 text-purple-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Request Callback</h3>
              <p className="text-[var(--text-secondary)] mb-4">We'll call you back</p>
              <button className="w-full px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-full font-semibold hover:bg-[#d8b87f] transition-colors">
                Request Callback
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[var(--surface)] rounded-lg shadow-lg p-8 border border-[var(--border-color)]">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    I am a
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  >
                    <option value="non-member">Non-Member</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitStatus === 'loading'}
                  className="w-full px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-full hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                </button>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-green-400 font-medium">
                      ✓ Thank you for your message! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                    <p className="text-red-400 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Contact Info */}
      <section className="py-20 bg-[var(--background)] border-t border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--gold)] mb-8">Other Ways to Reach Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Phone</h3>
                <a href="tel:+12079471999" className="text-[var(--gold)] hover:text-[#d8b87f] text-lg transition-colors">
                  207-947-1999
                </a>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Address</h3>
                <div className="text-[var(--gold)] text-lg">
                  P.O. Box 52<br />
                  Detroit, ME. 04929
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Email</h3>
                <a href="mailto:support@membershipauto.com" className="text-[var(--gold)] hover:text-[#d8b87f] text-lg transition-colors">
                  support@membershipauto.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

