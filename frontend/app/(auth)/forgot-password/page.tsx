// Forgot Password Page
'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call your backend API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center mt-20 h-screen overflow-hidden bg-[var(--background)]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[var(--surface)] shadow-lg animate-fade-in flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-[var(--gold)] text-center">Forgot Password</h2>
        {submitted ? (
          <div className="text-center text-[var(--gold)]">
            If an account with that email exists, a password reset link has been sent.
          </div>
        ) : (
          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[var(--foreground)] mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-[var(--surface)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--foreground)] placeholder-[var(--text-muted)]"
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" className="w-full py-2 rounded bg-[var(--gold)] text-[var(--background)] font-semibold hover:bg-[#b89354] transition">
              Send Reset Link
            </button>
          </form>
        )}
        <div className="mt-6 text-sm text-[var(--text-secondary)] text-center">
          <a href="/auth" className="text-[var(--gold)] underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
}
