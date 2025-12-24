'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface PaymentInfo {
  client_secret: string;
  payment_id: string;
  amount: number;
  plan_name: string;
  publishable_key: string;
  email?: string;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const info = sessionStorage.getItem('paymentIntent');
    if (info) {
      setPaymentInfo(JSON.parse(info));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentInfo) {
      setError('Payment system not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        paymentInfo.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              email: paymentInfo.email || undefined,
            },
          },
          // save_payment_method will be handled by setup_future_usage on server
        }
      );

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        
        // Confirm payment with backend to create membership
        try {
          const confirmResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/confirm-payment/`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token') || localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({
                payment_id: paymentInfo.payment_id,
              }),
            }
          );
          
          if (confirmResponse.ok) {
            const confirmData = await confirmResponse.json();
            console.log('Payment confirmed:', confirmData);
          } else {
            console.error('Failed to confirm payment with backend');
          }
        } catch (err) {
          console.error('Error confirming payment:', err);
        }
        
        sessionStorage.removeItem('paymentIntent');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!paymentInfo || !isClient) {
    return (
      <div className="text-center py-12">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg className="w-12 h-12 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-500 mb-2">Payment Successful!</h2>
        <p className="text-[var(--text-secondary)] mb-4">You've been upgraded to {paymentInfo.plan_name}</p>
        <p className="text-sm text-[var(--text-muted)]">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border-color)]">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
          Card Details
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: 'var(--text-primary, #ffffff)',
                '::placeholder': {
                  color: 'var(--text-muted, #999999)',
                },
              },
              invalid: {
                color: '#ff6b6b',
              },
            },
          }}
          className="p-3"
        />
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border-color)]">
        <div className="flex justify-between mb-2">
          <span className="text-[var(--text-secondary)]">Plan:</span>
          <span className="font-semibold">{paymentInfo.plan_name}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-[var(--text-secondary)]">Amount:</span>
          <span className="font-bold text-[var(--gold)]">${paymentInfo.amount}/mo</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[var(--gold)] text-[#0d0d0d] font-semibold py-3 rounded-lg hover:bg-[#d8b87f] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${paymentInfo.amount}/month`
        )}
      </button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Your payment is secure and encrypted. You can cancel anytime from your account settings.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const info = sessionStorage.getItem('paymentIntent');
    if (info) {
      const parsed = JSON.parse(info);
      setPaymentInfo(parsed);
      setStripePromise(loadStripe(parsed.publishable_key));
    }
  }, []);

  if (!isClient || !paymentInfo || !stripePromise) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[var(--gold)] mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <section className="bg-[#111111] py-12 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-2">
            Secure Checkout
          </h1>
          <p className="text-[var(--text-secondary)]">Complete your upgrade to start your membership</p>
        </div>
      </section>

      {/* Checkout Form */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Elements stripe={stripePromise} options={{
            clientSecret: paymentInfo.client_secret,
            appearance: {
              theme: 'night',
            },
          }}>
            <CheckoutForm />
          </Elements>
        </div>
      </section>
    </div>
  );
}
