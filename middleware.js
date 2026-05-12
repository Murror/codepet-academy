// Vercel Edge Middleware — pick default language by IP country.
//
//   • Vietnam (VN) visitors who hit `/` get redirected to `/index-vi.html`.
//   • Everyone else falls through to `/index.html` (the default).
//   • A `codepet-lang` cookie set by each page on load (see the <script> blocks
//     in index.html / index-vi.html) overrides geo detection — once a visitor
//     has clicked the EN/VI toggle, their manual choice sticks for one year,
//     even if they're in Vietnam.
//
// Vercel auto-detects this file at the project root and runs it on the edge
// before any static file is served.

export const config = {
  // Only run on the root URL — direct visits to /index-vi.html, /api/*,
  // /pets/*, /fonts/* etc. pass through unchanged.
  matcher: '/',
};

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function middleware(request) {
  const lang = getCookie(request, 'codepet-lang');

  // 1) Manual choice always wins
  if (lang === 'vi') {
    return Response.redirect(new URL('/index-vi.html', request.url), 307);
  }
  if (lang === 'en') {
    return; // fall through — default static handler serves /index.html
  }

  // 2) First visit: pick from IP country.
  //    Vercel auto-populates `x-vercel-ip-country` with the ISO 3166-1 alpha-2 code.
  const country = request.headers.get('x-vercel-ip-country') || '';
  if (country === 'VN') {
    return Response.redirect(new URL('/index-vi.html', request.url), 307);
  }
  // Else: serve English by default
}
