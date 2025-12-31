'use client';

import { useState } from 'react';
import { Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataDeletionPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/request-deletion/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }

      setSuccess(true);
      setEmail('');
      setReason('');
    } catch (err) {
      setError('Failed to submit request. Please try again or contact support@membershipauto.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d0d0d] to-[#1a1a1a] border-b border-[var(--border-color)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-[var(--gold)]" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)]">
              Data Deletion Request
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] text-lg">
            Request permanent deletion of your personal data
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Information Section */}
          <div className="bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Before You Request Deletion</h2>
            <div className="space-y-4 text-[var(--text-secondary)]">
              <p className="leading-relaxed">
                By submitting this request, you are asking us to permanently delete all personal data associated 
                with your Membership Auto account. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email, phone number)</li>
                <li>Vehicle information and service history</li>
                <li>Appointment history</li>
                <li>Payment history and saved payment methods</li>
                <li>Membership and rewards data</li>
                <li>All uploaded documents and images</li>
              </ul>
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400 mb-2">Important Information:</p>
                    <ul className="space-y-1 text-sm text-red-300">
                      <li>• This action is permanent and cannot be undone</li>
                      <li>• Active memberships will be cancelled</li>
                      <li>• You will lose access to all services immediately</li>
                      <li>• Processing may take up to 30 days</li>
                      <li>• Some data may be retained for legal/compliance purposes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          {success ? (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted Successfully</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                We have received your data deletion request. You will receive a confirmation email shortly.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Our team will process your request within 30 days. If you have any questions, please contact 
                us at <a href="mailto:privacy@membershipauto.com" className="text-[var(--gold)] hover:underline">
                  privacy@membershipauto.com
                </a>
              </p>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Submit Deletion Request</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:border-[var(--gold)] transition-colors"
                    placeholder="Enter your registered email address"
                  />
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Enter the email address associated with your Membership Auto account
                  </p>
                </div>

                {/* Reason Field */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Reason for Deletion (Optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
                    placeholder="Help us improve by telling us why you're leaving (optional)"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Submit Deletion Request
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-[var(--text-muted)]">
                  By submitting this form, you acknowledge that you understand the consequences of data deletion 
                  as outlined in our{' '}
                  <a href="/privacy" className="text-[var(--gold)] hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </div>
          )}

          {/* Contact Information */}
          <div className="mt-8 bg-[#1a1a1a] border border-[var(--border-color)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              If you have questions about data deletion or our privacy practices, please contact us:
            </p>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:privacy@membershipauto.com" className="text-[var(--gold)] hover:underline">
                  privacy@membershipauto.com
                </a>
              </p>
              <p>
                <strong className="text-white">Phone:</strong> 207-947-1999
              </p>
              <p>
                <strong className="text-white">Mail:</strong> Membership Auto, P.O. Box 52, Detroit, ME 04929, USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
