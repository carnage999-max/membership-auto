'use client';

import dynamic from 'next/dynamic';

const ForgotPasswordForm = dynamic(
  () => import('./client').then(mod => mod.default),
  { ssr: false }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
