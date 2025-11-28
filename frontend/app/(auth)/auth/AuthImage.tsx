// AuthImage.tsx - Shows different images for login/signup, responsive to form state
'use client';
import { useState, useEffect } from 'react';

export default function AuthImage() {
  // Listen for mode change via window event (simple pub/sub for demo)
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && (e.detail === 'login' || e.detail === 'signup')) setMode(e.detail);
    };
    window.addEventListener('authModeChange', handler);
    return () => window.removeEventListener('authModeChange', handler);
  }, []);

  // Show login image at top on mobile only for login, and on left for desktop
  // Show correct image for login/signup, on both mobile and desktop, no gradient overlays
  const imgSrc = mode === 'login' ? '/images/auth/login.jpg' : '/images/auth/signup.jpg';
  const imgAlt = mode === 'login' ? 'Login' : 'Sign Up';
  return (
    <>
      {/* Mobile: show image at top, edge-to-edge, fits top of screen */}
      <div className="block md:hidden w-full bg-black relative" style={{height: '35vh', minHeight: 120, maxHeight: 240}}>
        <img
          src={imgSrc}
          alt={imgAlt}
          className="object-cover w-full h-full m-0 p-0 border-none"
          style={{ display: 'block', height: '100%' }}
        />
      </div>
      {/* Desktop: show image on left, edge-to-edge */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-black relative h-full">
        <img
          src={imgSrc}
          alt={imgAlt}
          className="object-cover w-full h-full max-h-screen transition-all duration-500 m-0 p-0 border-none"
          style={{ display: 'block' }}
        />
      </div>
    </>
  );
}
