'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function MileageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
