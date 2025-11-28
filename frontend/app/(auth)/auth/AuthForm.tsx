// AuthForm.tsx - Handles login/signup toggle, form fields, and animation
'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const loginFields = [
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true },
];

const signupFields = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true },
  { name: 'membershipId', label: 'Membership ID / Verification Code', type: 'text', required: true },
];

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Helper to switch mode
  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
  };
  const fields = mode === 'login' ? loginFields : signupFields;
  const [showPassword, setShowPassword] = useState(false);

  // Helper to render input with show/hide for password
  const renderInput = (field: any) => {
    if (field.type !== 'password') {
      return (
        <input
          id={field.name}
          name={field.name}
          type={field.type}
          required={field.required}
          className="w-full px-4 py-2 rounded bg-[var(--surface)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--foreground)] placeholder-[var(--text-muted)]"
          placeholder={field.label}
        />
      );
    }
    return (
      <div className="relative">
        <input
          id={field.name}
          name={field.name}
          type={showPassword ? 'text' : 'password'}
          required={field.required}
          className="w-full px-4 py-2 rounded bg-[var(--surface)] border border-[var(--border-color)] focus:border-[var(--gold)] text-[var(--foreground)] placeholder-[var(--text-muted)] pr-12"
          placeholder={field.label}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--gold)] focus:text-[var(--gold)] p-2 outline-none"
          style={{cursor: 'pointer'}}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md p-8 rounded-lg bg-[var(--surface)] shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-[var(--gold)] text-center">
        {mode === 'login' ? 'Sign In to Membership Auto' : 'Create Your Account'}
      </h2>
      <form className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-[var(--foreground)] mb-1" htmlFor={field.name}>{field.label}</label>
            {renderInput(field)}
          </div>
        ))}
        <button type="submit" className="w-full py-2 mt-2 rounded bg-[var(--gold)] text-[var(--background)] font-semibold hover:bg-[#b89354] transition">
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div className="flex justify-between items-center mt-4 text-sm">
        {mode === 'login' ? (
          <>
            <span className="text-[var(--text-secondary)]">New here?</span>
            <button className="text-[var(--gold)] ml-2 hover:underline focus:underline outline-none transition-colors" style={{cursor: 'pointer'}} onClick={() => handleModeChange('signup')}>Sign Up</button>
          </>
        ) : (
          <>
            <span className="text-[var(--text-secondary)]">Already have an account?</span>
            <button className="text-[var(--gold)] ml-2 hover:underline focus:underline outline-none transition-colors" style={{cursor: 'pointer'}} onClick={() => handleModeChange('login')}>Login</button>
          </>
        )}
      </div>
      {mode === 'login' && (
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-[var(--gold)] underline">Forgot Password?</a>
        </div>
      )}
      <div className="mt-6 text-xs text-[var(--text-muted)] text-center">
        By continuing, you agree to our <a href="/terms" className="underline text-[var(--gold)]">Terms</a> and <a href="/privacy" className="underline text-[var(--gold)]">Privacy Policy</a>.
      </div>
    </div>
  );
}
