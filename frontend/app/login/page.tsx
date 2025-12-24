"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, AlertCircle } from "lucide-react";
import { useAuth } from "../../lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(signupName, signupEmail, signupPhone, signupPassword, membershipId || undefined);
      // Redirect to dashboard on successful registration
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex items-center justify-center">
              <Image
                src="/images/logo.jpeg"
                alt="Membership Auto logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-2xl tracking-tight text-gold">
              Membership Auto
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-text-secondary">
            {isLogin ? "Sign in to access your account" : "Join the revolution in vehicle care"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-surface rounded-lg shadow-lg border border-border-color overflow-hidden">
          <div className="flex border-b border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative flex-1 px-6 py-4 text-base font-semibold transition-colors duration-300 focus:outline-none ${
                isLogin
                  ? "text-[#CBA86E]"
                  : "text-[#707070] hover:text-[#B3B3B3]"
              }`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#CBA86E]"></span>}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative flex-1 px-6 py-4 text-base font-semibold transition-colors duration-300 focus:outline-none ${
                !isLogin
                  ? "text-[#CBA86E]"
                  : "text-[#707070] hover:text-[#B3B3B3]"
              }`}
            >
              Sign Up
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#CBA86E]"></span>}
            </button>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-[#DD4A48]/10 border border-[#DD4A48]/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#DD4A48] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#DD4A48]">{error}</p>
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-gold transition-colors"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border-color bg-[#0d0d0d] text-gold focus:ring-gold focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-gold hover:text-[#d8b87f] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-[#0D0D0D] bg-[#CBA86E] hover:bg-[#d8b87f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBA86E] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="signup-phone" className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-gold transition-colors"
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Membership ID Field */}
                <div>
                  <label htmlFor="membership-id" className="block text-sm font-medium text-white mb-2">
                    Membership ID / Code (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      id="membership-id"
                      name="membership-id"
                      type="text"
                      value={membershipId}
                      onChange={(e) => setMembershipId(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-border-color rounded-lg bg-[#0d0d0d] text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                      placeholder="e.g. REF-ABCD12"
                    />
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="h-4 w-4 rounded border-border-color bg-[#0d0d0d] text-gold focus:ring-gold focus:ring-offset-0 cursor-pointer mt-0.5"
                  />
                  <label htmlFor="accept-terms" className="ml-2 block text-sm text-text-secondary">
                    I agree to the{" "}
                    <Link href="/terms" className="text-gold hover:text-[#d8b87f] transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-gold hover:text-[#d8b87f] transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-[#0D0D0D] bg-[#CBA86E] hover:bg-[#d8b87f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CBA86E] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
