import { NextResponse } from 'next/server';

/**
 * Fallback handler for broken S3 images
 * Returns a placeholder image when S3 images fail
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  try {
    // Try to fetch the actual image with a shorter timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const imageBuffer = await response.arrayBuffer();
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.warn('Image fetch failed, using placeholder:', error);
  }

  // Return a placeholder SVG if fetch fails
  const placeholderSvg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#1a1a1a"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#666" font-family="Arial" font-size="16">
        Image Unavailable
      </text>
    </svg>
  `;

  return new NextResponse(placeholderSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
