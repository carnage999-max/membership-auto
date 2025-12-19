'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
