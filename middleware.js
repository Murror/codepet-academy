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
//
// Hosting note: this site is served BOTH at codepet-academy.vercel.app/ AND
// at code-pet.com/academy/ (via a Next.js rewrite on the main code-pet.com
// site). When proxied through code-pet.com, the browser URL bar shows the
// /academy/... prefix — so any redirect we emit must include that prefix,
// otherwise the browser resolves the Location header relative to the bar
// (code-pet.com/index-vi.html) and lands on a 404. We detect this by checking
// the x-forwarded-host / host headers for code-pet.com.

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

// When the request is proxied via the main code-pet.com Next.js rewrite,
// all redirect paths need to be prefixed with /academy so the browser's
// follow-up request still hits the rewrite. Returns '/academy' when on
// code-pet.com, '' when accessed directly on codepet-academy.vercel.app.
function getBasePath(request) {
  const fwdHost = (request.headers.get('x-forwarded-host') || '').toLowerCase();
  const host = (request.headers.get('host') || '').toLowerCase();
  if (fwdHost.includes('code-pet.com') || host.includes('code-pet.com')) {
    return '/academy';
  }
  return '';
}

export default function middleware(request) {
  const lang = getCookie(request, 'codepet-lang');
  const base = getBasePath(request);

  // 1) Manual choice always wins
  if (lang === 'vi') {
    return Response.redirect(new URL(`${base}/index-vi.html`, request.url), 307);
  }
  if (lang === 'en') {
    return; // fall through — default static handler serves /index.html
  }

  // 2) First visit: pick from IP country.
  //    Vercel auto-populates `x-vercel-ip-country` with the ISO 3166-1 alpha-2 code.
  const country = request.headers.get('x-vercel-ip-country') || '';
  if (country === 'VN') {
    return Response.redirect(new URL(`${base}/index-vi.html`, request.url), 307);
  }
  // Else: serve English by default
}
