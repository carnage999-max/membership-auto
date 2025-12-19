'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function DiagnosticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
