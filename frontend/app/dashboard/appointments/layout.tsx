'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
